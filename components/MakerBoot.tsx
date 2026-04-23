"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAppsByMaker, getMakerDisplay } from "@/lib/storage";
import type { AppEntry } from "@/lib/types";
import AppCard from "./AppCard";
import { ArrowGlyph, LinkButton } from "./Button";

export default function MakerBoot({ handle }: { handle: string }) {
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [display, setDisplay] = useState<{ name: string; handle?: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [list, disp] = await Promise.all([getAppsByMaker(handle), getMakerDisplay(handle)]);
      if (!active) return;
      setApps(list);
      setDisplay(disp);
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [handle]);

  const totals = useMemo(() => {
    const upvotes = apps.reduce((acc, a) => acc + a.upvotes, 0);
    const tools = new Set<string>();
    apps.forEach((a) => a.tools.forEach((t) => tools.add(t)));
    return { upvotes, tools: tools.size };
  }, [apps]);

  if (!loaded) {
    return (
      <div className="container-page py-24">
        <div className="mx-auto h-6 w-32 animate-pulse rounded-full bg-paper/10" />
      </div>
    );
  }

  if (!display) {
    return (
      <div className="container-page py-24 text-center">
        <div className="eyebrow mb-3">404</div>
        <h1 className="display mb-6 text-[64px]">No maker by that name.</h1>
        <LinkButton href="/" variant="paper" trailing={<ArrowGlyph />}>
          Back to the gallery
        </LinkButton>
      </div>
    );
  }

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

      {apps.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-paper/20 p-10 text-center">
          <div className="display text-3xl">Nothing shelved yet.</div>
          <div className="text-paper-dim">This maker hasn't put anything up.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((a, i) => (
            <AppCard key={a.slug} app={a} index={i} />
          ))}
        </div>
      )}
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
