"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { AppEntry } from "@/lib/types";
import AppCard from "./AppCard";

interface MakerDisplay {
  name: string;
  handle?: string;
}

export default function MakerBoot({
  handle,
  initialApps,
  initialDisplay,
}: {
  handle: string;
  initialApps: AppEntry[];
  initialDisplay: MakerDisplay;
}) {
  const apps = initialApps;
  const display = initialDisplay;

  const totals = useMemo(() => {
    const upvotes = apps.reduce((acc, a) => acc + a.upvotes, 0);
    const tools = new Set<string>();
    apps.forEach((a) => a.tools.forEach((t) => tools.add(t)));
    return { upvotes, tools: tools.size };
  }, [apps]);

  const initials = display.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="container-page pb-20 pt-8">
      <div className="mb-10 flex items-center justify-between">
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim hover:text-paper">
          ← Back to shelf
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim">
          /maker/{handle}
        </span>
      </div>

      <section className="mb-16 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="eyebrow mb-4 flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-acid" />
            Maker profile
          </div>
          <div className="flex items-center gap-5">
            <div
              className="display flex h-20 w-20 items-center justify-center rounded-full border border-ink bg-paper text-[28px] text-ink"
              aria-hidden
            >
              {initials}
            </div>
            <div>
              <h1 className="display text-[clamp(44px,7vw,88px)] leading-[0.95] text-balance">
                {display.name}
              </h1>
              {display.handle && (
                <div className="mt-2 font-mono text-[12px] uppercase tracking-[0.22em] text-paper-dim">
                  {display.handle}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="rounded-2xl border border-paper/15 bg-ink-soft p-6">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-acid" />
            <dl className="grid grid-cols-3 gap-4 text-center">
              <Stat k="Shelved" v={apps.length.toString().padStart(2, "0")} />
              <Stat k="Upvotes" v={totals.upvotes.toString()} />
              <Stat k="Tools" v={totals.tools.toString().padStart(2, "0")} />
            </dl>
          </div>
        </aside>
      </section>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="eyebrow">On the shelf</div>
          <h2 className="display mt-2 text-[clamp(32px,4vw,56px)]">
            {apps.length === 1 ? "One entry" : `${apps.length} entries`} by {display.name.split(" ")[0]}.
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((a, i) => (
          <AppCard key={a.slug} app={a} index={i} />
        ))}
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="display text-[28px] leading-none text-paper">{v}</div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">{k}</div>
    </div>
  );
}
