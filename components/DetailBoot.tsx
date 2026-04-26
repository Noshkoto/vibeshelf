"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { builtNote } from "@/lib/editorial";
import { deleteUserApp, isUserApp, makerKey } from "@/lib/storage";
import { llmLabel, LLMS } from "@/lib/llms";
import { categoryLabel, toolLabel } from "@/lib/tools";
import type { AppEntry } from "@/lib/types";
import { ArrowGlyph, LinkButton } from "./Button";
import CoverArt from "./CoverArt";
import ShareDialog from "./ShareDialog";
import ToolBadge from "./ToolBadge";
import UpvoteButton from "./UpvoteButton";

export default function DetailBoot({ slug, initialApp }: { slug: string; initialApp: AppEntry }) {
  const router = useRouter();
  const app = initialApp;
  const [owned, setOwned] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let active = true;
    isUserApp(slug).then((owns) => {
      if (active) setOwned(owns);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  const mKey = makerKey(app);

  async function handleDelete() {
    const ok = await deleteUserApp(slug);
    if (ok) router.push("/");
    setConfirmOpen(false);
  }

  return (
    <article className="container-page pb-16 pt-8">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim hover:text-paper">
          ← Back to shelf
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim">
          {categoryLabel(app.category)} · /{app.slug}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-paper/15 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]">
            {app.customCoverDataUrl ? (
              <div style={{ aspectRatio: "4 / 3" }} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={app.customCoverDataUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            ) : (
              <CoverArt palette={app.palette} motif={app.motif} title={app.title} tagline={app.tagline} variant="hero" />
            )}
          </div>

          <div className="mt-10 max-w-[62ch]">
            <h1 className="display mb-4 text-[clamp(44px,6vw,72px)] text-balance">{app.title}</h1>
            <p className="mb-6 text-pretty text-[20px] leading-[1.45] text-paper">{app.tagline}</p>
            {builtNote(app.slug) && (
              <figure className="mb-8 border-l-2 border-acid pl-4">
                <blockquote className="font-display text-[17px] italic leading-[1.55] text-paper">
                  {builtNote(app.slug)}
                </blockquote>
                <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                  — Curator&apos;s note
                </figcaption>
              </figure>
            )}
            <div className="rule-paper-dashed mb-6 opacity-40" />
            <p className="text-pretty text-[16px] leading-[1.7] text-paper-dim">{app.description}</p>

            {(app.hoursToShip != null || app.keyPrompt || app.gotcha) && (
              <section className="mt-12">
                <div className="eyebrow mb-4">How they built it</div>
                <div className="grid grid-cols-12 gap-5">
                  {app.hoursToShip != null && (
                    <div className="col-span-12 sm:col-span-4 rounded-2xl border border-paper/15 bg-ink-soft p-5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                        Hours to ship
                      </div>
                      <div className="display mt-2 text-[44px] leading-none text-paper">
                        {formatHours(app.hoursToShip)}
                      </div>
                      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                        {hoursLabel(app.hoursToShip)}
                      </div>
                    </div>
                  )}
                  {app.keyPrompt && (
                    <div className="col-span-12 sm:col-span-8 rounded-2xl border border-paper/15 bg-ink-soft p-5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                        The prompt that cracked it
                      </div>
                      <p className="mt-3 font-display text-[16px] italic leading-[1.55] text-paper">
                        &ldquo;{app.keyPrompt}&rdquo;
                      </p>
                    </div>
                  )}
                  {app.gotcha && (
                    <div className="col-span-12 rounded-2xl border border-dashed border-paper/20 p-5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                        One thing that didn&apos;t work
                      </div>
                      <p className="mt-3 text-[15px] leading-[1.6] text-paper-dim">
                        {app.gotcha}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-8 space-y-6">
            <div className="flex flex-col gap-3">
              <LinkButton href={app.liveUrl} external variant="accent" size="lg" trailing={<ArrowGlyph />}>
                Open the app
              </LinkButton>
              <UpvoteButton slug={app.slug} initial={app.upvotes} />
              <ShareDialog app={app} variant="compact" />
            </div>

            <div className="rounded-2xl border border-paper/15 bg-ink-soft p-6">
              <div className="eyebrow mb-4">Built with</div>
              <div className="flex flex-wrap gap-2">
                {app.tools.map((t) => (
                  <ToolBadge key={t} tool={t} size="md" />
                ))}
              </div>
              {app.llms && app.llms.length > 0 && (
                <>
                  <div className="rule-paper-dashed my-4 opacity-40" />
                  <div className="eyebrow mb-3">Powered by</div>
                  <div className="flex flex-wrap gap-2">
                    {app.llms.map((id) => {
                      const entry = LLMS.find((l) => l.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex h-7 items-center gap-1.5 rounded-full border border-paper/30 px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-paper"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                          {entry?.label ?? llmLabel(id)}
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="rule-paper-dashed my-5 opacity-40" />
              <div className="eyebrow mb-3">Maker</div>
              <Link
                href={`/maker/${mKey}`}
                className="group flex items-center justify-between rounded-lg -m-2 p-2 transition-colors hover:bg-paper/[0.04]"
              >
                <div>
                  <div className="text-[15px] text-paper group-hover:text-acid">{app.makerName}</div>
                  {app.makerHandle && (
                    <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper-dim">
                      {app.makerHandle}
                    </div>
                  )}
                </div>
                <Avatar name={app.makerName} />
              </Link>
            </div>

            <div className="rounded-2xl border border-paper/15 bg-ink-soft p-6">
              <div className="eyebrow mb-3">Spec sheet</div>
              <dl className="space-y-2 text-[13px]">
                <Row k="Category" v={categoryLabel(app.category)} />
                <Row k="Tools" v={app.tools.map(toolLabel).join(" · ")} />
                {app.llms && app.llms.length > 0 && (
                  <Row k="LLMs" v={app.llms.map(llmLabel).join(" · ")} />
                )}
                <Row k="Shelved" v={new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                <Row k="URL" v={prettyUrl(app.liveUrl)} />
              </dl>
            </div>

            {owned && (
              <div className="rounded-2xl border border-dashed border-paper/20 p-5">
                <div className="eyebrow mb-2">Your shelf entry</div>
                <p className="mb-4 text-[13px] text-paper-dim">
                  You shelved this on this device. You can take it down any time.
                </p>
                {!confirmOpen ? (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="w-full rounded-[10px] border border-paper/20 bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim transition-colors hover:border-ember hover:text-ember"
                  >
                    Remove from shelf
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[12px] text-paper">Really take it down?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        className="flex-1 rounded-[10px] border border-ember bg-ember px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-transform hover:-translate-y-[1px]"
                      >
                        Yes, remove
                      </button>
                      <button
                        onClick={() => setConfirmOpen(false)}
                        className="flex-1 rounded-[10px] border border-paper/20 bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim hover:text-paper"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">{k}</dt>
      <dd className="text-right text-paper">{v}</dd>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="display flex h-12 w-12 items-center justify-center rounded-full border border-ink bg-paper text-[18px] text-ink"
      aria-hidden
    >
      {initials}
    </div>
  );
}

function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h === Math.floor(h)) return `${h}h`;
  return `${h.toFixed(1)}h`;
}

function hoursLabel(h: number): string {
  if (h <= 1) return "snack-sized";
  if (h <= 4) return "afternoon build";
  if (h <= 12) return "long sitting";
  if (h <= 40) return "weekend project";
  return "ongoing labour";
}

function prettyUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    return url;
  }
}
