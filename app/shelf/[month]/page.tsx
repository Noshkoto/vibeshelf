import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppCard from "@/components/AppCard";
import { ArrowGlyph, LinkButton } from "@/components/Button";
import {
  appIssue,
  currentIssue,
  isValidIssue,
  issueLabel,
  issueNote,
  nextIssue,
  parseIssueSlug,
  prevIssue,
  shelfNumber,
} from "@/lib/editorial";
import { fetchAllApps } from "@/lib/server";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { month: string };
}): Promise<Metadata> {
  const parsed = parseIssueSlug(params.month);
  if (!parsed || !isValidIssue(parsed)) {
    return {
      title: "Issue not found",
      description: "This issue of the shelf has no entries, or never existed.",
    };
  }
  const num = shelfNumber(parsed.year, parsed.month);
  const label = issueLabel(parsed);
  const canonical = `/shelf/${parsed.slug}`;
  return {
    title: `Shelf №${num} · ${label}`,
    description: `Issue ${num} of Vibeshelf — apps shelved in ${label}.`,
    alternates: { canonical },
    openGraph: {
      title: `Shelf №${num} · ${label} · Vibeshelf`,
      description: `Issue ${num} of Vibeshelf.`,
      url: canonical,
      type: "article",
      siteName: "Vibeshelf",
    },
  };
}

export default async function ShelfIssue({
  params,
}: {
  params: { month: string };
}) {
  const parsed = parseIssueSlug(params.month);
  if (!parsed || !isValidIssue(parsed)) notFound();

  const apps = await fetchAllApps();
  const entries = apps
    .filter((a) => appIssue(a.createdAt).slug === parsed.slug)
    .sort((a, b) => b.upvotes - a.upvotes);

  const num = shelfNumber(parsed.year, parsed.month);
  const label = issueLabel(parsed);
  const note = issueNote(parsed.slug);
  const prev = prevIssue(parsed);
  const next = nextIssue(parsed);
  const isCurrent = parsed.slug === currentIssue().slug;

  return (
    <div className="container-page pb-24 pt-10">
      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim hover:text-paper"
        >
          ← Back to shelf
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim">
          {isCurrent ? "Current issue" : "Back issue"} · {parsed.slug}
        </span>
      </div>

      <header className="mb-16 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="eyebrow mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-acid" />
            Shelf №{num} · {label}
            {isCurrent && <span className="text-acid">· current issue</span>}
          </div>
          <h1 className="display text-[clamp(52px,8vw,112px)] text-balance">
            Issue <span className="hero-accent italic text-acid">№{num}</span>
          </h1>
          <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim">
            {label} · {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </div>
        </div>
        <aside className="col-span-12 lg:col-span-4">
          {note ? (
            <div className="relative overflow-hidden rounded-2xl border border-paper/15 bg-ink-soft p-6">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-acid" />
              <div className="eyebrow mb-3">Editor's note</div>
              <p className="text-pretty text-[15px] italic leading-[1.6] text-paper">
                &ldquo;{note}&rdquo;
              </p>
              <div className="rule-paper-dashed my-5 opacity-40" />
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                — The shelf
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-paper/20 p-6">
              <div className="eyebrow mb-2">This issue</div>
              <p className="text-[15px] text-paper-dim">
                Fresh arrivals, loosely arranged.
              </p>
            </div>
          )}
        </aside>
      </header>

      {entries.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-paper/20 p-12 text-center">
          <div className="display text-[clamp(28px,4vw,40px)]">
            This issue is still being set.
          </div>
          <p className="max-w-[46ch] text-paper-dim">
            No entries have been shelved in {label} yet. Come back at month&apos;s end — or
            shelve the first one now.
          </p>
          {isCurrent && (
            <LinkButton href="/submit" variant="accent" size="md" trailing={<ArrowGlyph />}>
              Shelve yours
            </LinkButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((a, i) => (
            <AppCard key={a.slug} app={a} index={i} rank={i + 1} />
          ))}
        </div>
      )}

      <nav className="mt-20 flex flex-col gap-6 border-t border-paper/10 pt-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-[12rem]">
          {prev ? (
            <Link href={`/shelf/${prev.slug}`} className="group block">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                ← Previous issue
              </div>
              <div className="display mt-1 text-[22px] text-paper transition-colors group-hover:text-acid">
                №{shelfNumber(prev.year, prev.month)} · {issueLabel(prev)}
              </div>
            </Link>
          ) : (
            <div className="opacity-50">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                Previous issue
              </div>
              <div className="display mt-1 text-[22px] text-paper-dim">
                — first issue
              </div>
            </div>
          )}
        </div>
        <div className="min-w-[12rem] sm:text-right">
          {next ? (
            <Link href={`/shelf/${next.slug}`} className="group block">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                Next issue →
              </div>
              <div className="display mt-1 text-[22px] text-paper transition-colors group-hover:text-acid">
                №{shelfNumber(next.year, next.month)} · {issueLabel(next)}
              </div>
            </Link>
          ) : (
            <div className="opacity-50">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                Next issue
              </div>
              <div className="display mt-1 text-[22px] text-paper-dim">
                — still being set
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
