"use client";

import Link from "next/link";
import { useRef } from "react";
import { builtNote } from "@/lib/editorial";
import { categoryLabel } from "@/lib/tools";
import type { AppEntry } from "@/lib/types";
import CoverArt from "./CoverArt";
import ToolBadge from "./ToolBadge";

interface Props {
  app: AppEntry;
  index?: number;
  rank?: number;
}

export default function AppCard({ app, index = 0, rank }: Props) {
  const articleRef = useRef<HTMLElement | null>(null);

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = articleRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width;
    const my = (e.clientY - r.top) / r.height;
    const rx = (my - 0.5) * -5;
    const ry = (mx - 0.5) * 5;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--mx", `${mx * 100}%`);
    el.style.setProperty("--my", `${my * 100}%`);
  }

  function onLeave() {
    const el = articleRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <Link
      href={`/app/${app.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative block animate-slide-up"
      style={{
        animationDelay: `${Math.min(index, 8) * 60}ms`,
        perspective: "1400px",
      }}
    >
      <article
        ref={articleRef}
        className="relative overflow-hidden rounded-[14px] border border-paper/10 bg-ink-soft transition-[transform,border-color,box-shadow] duration-300 will-change-transform group-hover:border-paper/30 group-hover:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.85)]"
        style={{
          transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative">
          {app.customCoverDataUrl ? (
            <div className="relative" style={{ aspectRatio: "5 / 4" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={app.customCoverDataUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <CoverArt palette={app.palette} motif={app.motif} title={app.title} />
          )}

          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-paper backdrop-blur">
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
              <path d="M5 1 L9 5 L5 9 L1 5 Z" fill="#D4FF3B" />
            </svg>
            {app.upvotes}
          </div>
        </div>

        <div className="relative px-5 pb-5 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
              {categoryLabel(app.category)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
              {app.makerHandle ?? app.makerName}
            </span>
          </div>
          <h3 className="display mb-1 text-[28px] text-paper">{app.title}</h3>
          <p className="mb-3 text-pretty text-[14px] leading-snug text-paper-dim">{app.tagline}</p>
          {builtNote(app.slug) && (
            <p className="mb-4 border-l-2 border-acid/40 pl-2 font-display text-[12px] italic leading-snug text-paper-dim/80">
              {builtNote(app.slug)}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            {app.tools.slice(0, 3).map((t) => (
              <ToolBadge key={t} tool={t} />
            ))}
            {app.tools.length > 3 && (
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                +{app.tools.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Spotlight overlay (follows cursor) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(480px circle at var(--mx, 50%) var(--my, 50%), rgba(212,255,59,0.14), transparent 42%)",
          }}
        />

        {/* Catalog edition stamp */}
        {rank !== undefined && (
          <div className="pointer-events-none absolute left-3 top-3 flex h-6 items-center gap-1 rounded-full border border-paper/25 bg-ink/70 px-2 font-mono text-[10px] uppercase tracking-[0.28em] text-paper-dim backdrop-blur">
            <span className="text-acid">№</span>
            <span>{String(rank).padStart(2, "0")}</span>
          </div>
        )}
      </article>
    </Link>
  );
}
