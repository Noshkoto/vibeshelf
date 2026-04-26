"use client";

import { ensureSignedIn, getSupabase } from "./supabase";
import type { AppEntry, CategoryId, CoverPalette, LlmId, ToolId } from "./types";

interface DbApp {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  live_url: string;
  maker_name: string;
  maker_handle: string | null;
  tools: string[];
  category: string;
  palette: string;
  motif: string;
  cover_url: string | null;
  llms: string[] | null;
  owner_id: string;
  created_at: string;
}

function fromDb(row: DbApp, upvoteCount = 0): AppEntry {
  return {
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    liveUrl: row.live_url,
    makerName: row.maker_name,
    makerHandle: row.maker_handle ?? undefined,
    tools: row.tools as ToolId[],
    category: row.category as CategoryId,
    upvotes: upvoteCount,
    palette: row.palette as CoverPalette,
    motif: row.motif as AppEntry["motif"],
    customCoverDataUrl: row.cover_url ?? undefined,
    llms: (row.llms ?? []) as LlmId[],
    createdAt: row.created_at,
  };
}

export async function getAllApps(): Promise<AppEntry[]> {
  const supa = getSupabase();
  const [appsRes, countsRes] = await Promise.all([
    supa.from("apps").select("*").order("created_at", { ascending: false }),
    supa.from("upvote_counts").select("app_slug, upvote_count"),
  ]);

  const counts = new Map<string, number>();
  (countsRes.data ?? []).forEach((c: { app_slug: string; upvote_count: number | string }) =>
    counts.set(c.app_slug, Number(c.upvote_count))
  );

  return (appsRes.data ?? []).map((row: DbApp) => fromDb(row, counts.get(row.slug) ?? 0));
}

export async function getAppBySlug(slug: string): Promise<AppEntry | undefined> {
  const all = await getAllApps();
  return all.find((a) => a.slug === slug);
}

export async function saveUserApp(entry: AppEntry): Promise<AppEntry | null> {
  const ownerId = await ensureSignedIn();
  if (!ownerId) return null;
  const supa = getSupabase();

  const payload = {
    slug: entry.slug,
    title: entry.title,
    tagline: entry.tagline,
    description: entry.description,
    live_url: entry.liveUrl,
    maker_name: entry.makerName,
    maker_handle: entry.makerHandle ?? null,
    tools: entry.tools,
    category: entry.category,
    palette: entry.palette,
    motif: entry.motif,
    cover_url: entry.customCoverDataUrl ?? null,
    llms: entry.llms ?? [],
    owner_id: ownerId,
  };

  let { data, error } = await supa.from("apps").insert(payload).select().single();

  // Migration 002_add_llms.sql may not have run on this Supabase project yet —
  // fall back to inserting without the llms column so submissions still work.
  if (error?.code === "42703" && /llms/i.test(error.message)) {
    const { llms: _drop, ...legacy } = payload;
    void _drop;
    ({ data, error } = await supa.from("apps").insert(legacy).select().single());
  }

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error("saveUserApp failed", error);
    return null;
  }

  await supa.from("upvotes").insert({ app_slug: entry.slug, owner_id: ownerId });
  return fromDb(data as DbApp, 1);
}

export async function deleteUserApp(slug: string): Promise<boolean> {
  const ownerId = await ensureSignedIn();
  if (!ownerId) return false;
  const supa = getSupabase();
  const { error, count } = await supa
    .from("apps")
    .delete({ count: "exact" })
    .eq("slug", slug)
    .eq("owner_id", ownerId);
  return !error && (count ?? 0) > 0;
}

export async function isUserApp(slug: string): Promise<boolean> {
  const ownerId = await ensureSignedIn();
  if (!ownerId) return false;
  const supa = getSupabase();
  const { data } = await supa
    .from("apps")
    .select("owner_id")
    .eq("slug", slug)
    .maybeSingle();
  return data?.owner_id === ownerId;
}

export async function toggleUpvote(slug: string): Promise<boolean> {
  const ownerId = await ensureSignedIn();
  if (!ownerId) return false;
  const supa = getSupabase();
  const { data: existing } = await supa
    .from("upvotes")
    .select("app_slug")
    .eq("app_slug", slug)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (existing) {
    await supa.from("upvotes").delete().eq("app_slug", slug).eq("owner_id", ownerId);
    return false;
  }
  await supa.from("upvotes").insert({ app_slug: slug, owner_id: ownerId });
  return true;
}

export async function hasUpvoted(slug: string): Promise<boolean> {
  const ownerId = await ensureSignedIn();
  if (!ownerId) return false;
  const supa = getSupabase();
  const { data } = await supa
    .from("upvotes")
    .select("app_slug")
    .eq("app_slug", slug)
    .eq("owner_id", ownerId)
    .maybeSingle();
  return !!data;
}

export async function uploadCover(file: File): Promise<string | null> {
  const ownerId = await ensureSignedIn();
  if (!ownerId) return null;
  const supa = getSupabase();

  const extFromName = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : null;
  const extFromType = file.type.split("/")[1]?.toLowerCase();
  const ext = (extFromName || extFromType || "jpg").replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
  const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supa.storage.from("covers").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) {
    // eslint-disable-next-line no-console
    console.error("uploadCover failed", error);
    return null;
  }
  const { data } = supa.storage.from("covers").getPublicUrl(path);
  return data.publicUrl;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function ensureUniqueSlug(base: string): Promise<string> {
  const all = await getAllApps();
  const taken = new Set(all.map((a) => a.slug));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export function makerKey(app: AppEntry): string {
  const raw = (app.makerHandle ?? app.makerName).trim().toLowerCase();
  return raw.replace(/^@/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function getAppsByMaker(key: string): Promise<AppEntry[]> {
  const all = await getAllApps();
  const target = key.toLowerCase().replace(/^@/, "");
  return all.filter((a) => makerKey(a) === target);
}

export async function getMakerDisplay(key: string): Promise<{ name: string; handle?: string } | null> {
  const apps = await getAppsByMaker(key);
  if (apps.length === 0) return null;
  const withHandle = apps.find((a) => a.makerHandle);
  return {
    name: apps[0].makerName,
    handle: withHandle?.makerHandle,
  };
}
