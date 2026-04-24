"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { builtNote } from "@/lib/editorial";
import { deleteUserApp, isUserApp, makerKey } from "@/lib/storage";
import { categoryLabel, toolLabel } from "@/lib/tools";
import type { AppEntry } from "@/lib/types";
import { ArrowGlyph, LinkButton } from "./Button";
import CoverArt from "./CoverArt";
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
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-8 space-y-6">
            <div className="flex flex-col gap-3">
              <LinkButton href={app.liveUrl} external variant="accent" size="lg" trailing={<ArrowGlyph />}>
                Open the app
              </LinkButton>
              <UpvoteButton slug={app.slug} initial={app.upvotes} />
            </div>

            <div className="rounded-2xl border border-paper/15 bg-ink-soft p-6">
              <div className="eyebrow mb-4">Built with</div>
              <div className="flex flex-wrap gap-2">
                {app.tools.map((t) => (
                  <ToolBadge key={t} tool={t} size="md" />
                ))}
              </div>
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

function prettyUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    return url;
  }
}
