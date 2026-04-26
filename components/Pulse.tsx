import Link from "next/link";
import {
  appIssue,
  currentIssue,
  issueLabel,
  shelfNumber,
} from "@/lib/editorial";
import { fetchAllApps } from "@/lib/server";
import type { AppEntry } from "@/lib/types";

// Live pulse — three small panels above the gallery so the homepage feels
// inhabited at a glance: this issue's leader, who just shipped, and the
// running count for the current shelf.

export default async function Pulse() {
  const apps = await fetchAllApps();
  // Below ~3 entries the pulse looks anaemic; the existing Ticker covers
  // the empty case more gracefully so we just bow out.
  if (apps.length < 3) return null;

  const cur = currentIssue();
  const curNumber = shelfNumber(cur.year, cur.month);
  const inIssue = apps.filter((a) => appIssue(a.createdAt).slug === cur.slug);
  const leader =
    [...inIssue].sort((a, b) => b.upvotes - a.upvotes)[0] ??
    [...apps].sort((a, b) => b.upvotes - a.upvotes)[0];
  const recent = [...apps]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 3);
  const totalThisIssue = inIssue.length;

  return (
    <section className="mt-14 grid grid-cols-12 gap-5">
      <LeaderCard app={leader} issueLabel={issueLabel(cur)} curNumber={curNumber} />
      <RecentCard apps={recent} />
      <CountCard
        thisIssue={totalThisIssue}
        total={apps.length}
        curNumber={curNumber}
        issueSlug={cur.slug}
      />
    </section>
  );
}

function LeaderCard({
  app,
  issueLabel,
  curNumber,
}: {
  app: AppEntry;
  issueLabel: string;
  curNumber: number;
}) {
  return (
    <Link
      href={`/app/${app.slug}`}
      className="group relative col-span-12 overflow-hidden rounded-2xl border border-paper/15 bg-ink-soft p-6 transition-colors hover:border-paper/30 md:col-span-5"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-acid" />
      <div className="eyebrow mb-3 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-acid" />
        Top of Shelf №{curNumber}
      </div>
      <div className="display text-[clamp(28px,3vw,40px)] leading-[1.05] text-paper">
        {app.title}
      </div>
      <p className="mt-2 line-clamp-2 text-pretty text-[14px] leading-snug text-paper-dim">
        {app.tagline}
      </p>
      <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
        <span>by {app.makerHandle ?? app.makerName}</span>
        <span className="flex items-center gap-2 text-paper">
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
            <path d="M5 1 L9 5 L5 9 L1 5 Z" fill="var(--acid)" />
          </svg>
          {app.upvotes} upvotes
        </span>
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.28em] text-paper-dim/70">
        {issueLabel}
      </div>
    </Link>
  );
}

function RecentCard({ apps }: { apps: AppEntry[] }) {
  return (
    <div className="col-span-12 rounded-2xl border border-paper/15 bg-ink-soft p-6 md:col-span-4">
      <div className="eyebrow mb-4">Just shelved</div>
      <ul className="space-y-3">
        {apps.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/app/${a.slug}`}
              className="group flex items-baseline justify-between gap-3 border-b border-paper/10 pb-3 last:border-none last:pb-0"
            >
              <div className="min-w-0">
                <div className="truncate text-[15px] text-paper transition-colors group-hover:text-acid">
                  {a.title}
                </div>
                <div className="truncate font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                  {a.makerHandle ?? a.makerName}
                </div>
              </div>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                {timeAgo(a.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CountCard({
  thisIssue,
  total,
  curNumber,
  issueSlug,
}: {
  thisIssue: number;
  total: number;
  curNumber: number;
  issueSlug: string;
}) {
  return (
    <Link
      href={`/shelf/${issueSlug}`}
      className="group col-span-12 rounded-2xl border border-dashed border-paper/20 p-6 transition-colors hover:border-paper/40 md:col-span-3"
    >
      <div className="eyebrow mb-3">This issue</div>
      <div className="display text-[clamp(56px,6vw,88px)] leading-none text-paper">
        {String(thisIssue).padStart(2, "0")}
      </div>
      <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
        entries on Shelf №{curNumber}
      </div>
      <div className="rule-paper-dashed my-5 opacity-40" />
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
        <span>All-time</span>
        <span className="text-paper">{total}</span>
      </div>
    </Link>
  );
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < 5 * min) return "just now";
  if (diff < hr) return `${Math.round(diff / min)}m ago`;
  if (diff < day) return `${Math.round(diff / hr)}h ago`;
  if (diff < 7 * day) return `${Math.round(diff / day)}d ago`;
  return `${Math.round(diff / (7 * day))}w ago`;
}
