import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getServerClient() {
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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

export function makerKey(app: AppEntry): string {
  const raw = (app.makerHandle ?? app.makerName).trim().toLowerCase();
  return raw.replace(/^@/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const fetchAllApps = cache(async (): Promise<AppEntry[]> => {
  const supa = getServerClient();
  if (!supa) return [];

  const [appsRes, countsRes] = await Promise.all([
    supa.from("apps").select("*").order("created_at", { ascending: false }),
    supa.from("upvote_counts").select("app_slug, upvote_count"),
  ]);

  const counts = new Map<string, number>();
  (countsRes.data ?? []).forEach((c: { app_slug: string; upvote_count: number | string }) =>
    counts.set(c.app_slug, Number(c.upvote_count))
  );

  return (appsRes.data ?? []).map((row: DbApp) => fromDb(row, counts.get(row.slug) ?? 0));
});

export async function fetchAppBySlug(slug: string): Promise<AppEntry | undefined> {
  const all = await fetchAllApps();
  return all.find((a) => a.slug === slug);
}

export async function fetchAppsByMaker(key: string): Promise<AppEntry[]> {
  const all = await fetchAllApps();
  const target = key.toLowerCase().replace(/^@/, "");
  return all.filter((a) => makerKey(a) === target);
}
