"use client";

import { useEffect, useState } from "react";
import { getAllApps } from "@/lib/storage";
import type { AppEntry } from "@/lib/types";

export default function Ticker() {
  const [apps, setApps] = useState<AppEntry[]>([]);

  useEffect(() => {
    let active = true;
    getAllApps().then((list) => {
      if (active) setApps(list);
    });
    return () => {
      active = false;
    };
  }, []);

  if (apps.length === 0) return null;

  const recent = [...apps]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 10);

  // Duplicate so the translate -50% loop is seamless
  const track = [...recent, ...recent];

  return (
    <div className="relative -mx-[clamp(20px,4vw,48px)] mt-10 overflow-hidden border-y border-paper/15 bg-ink-soft/60">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent" />

      <div className="relative py-3">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap pr-8">
          {track.map((a, i) => (
            <span
              key={`${a.slug}-${i}`}
              className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-acid"
                style={{ boxShadow: "0 0 10px rgb(var(--color-acid) / 0.7)" }}
              />
              <span className="text-paper">New arrival</span>
              <span className="text-paper-dim">·</span>
              <span className="text-paper">{a.title}</span>
              <span className="text-paper-dim">by {a.makerHandle ?? a.makerName}</span>
              <span className="text-paper-dim">·</span>
              <span className="text-paper-dim">shelf no. {String((i % recent.length) + 1).padStart(3, "0")}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
