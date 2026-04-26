import Link from "next/link";
import { Suspense } from "react";
import { LinkButton, ArrowGlyph } from "@/components/Button";
import Gallery from "@/components/Gallery";
import Pulse from "@/components/Pulse";
import Ticker from "@/components/Ticker";
import {
  allIssues,
  currentIssue,
  issueLabel,
  shelfNumber,
} from "@/lib/editorial";

export const revalidate = 3600;

export default function HomePage() {
  const cur = currentIssue();
  const curNumber = shelfNumber(cur.year, cur.month);
  const issues = allIssues().slice().reverse();

  return (
    <div className="container-page relative pt-10">
      <section className="relative mb-20 grid grid-cols-12 gap-6 pt-8">
        <div className="col-span-12 lg:col-span-8">
          <Link
            href={`/shelf/${cur.slug}`}
            className="eyebrow mb-6 inline-flex items-center gap-3 transition-colors hover:text-paper"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-acid" />
            Shelf №{curNumber} · {issueLabel(cur)}
            <span className="text-acid">→</span>
          </Link>
          <h1 className="display text-[clamp(56px,9vw,144px)] text-balance">
            The <span className="hero-accent italic text-acid">shelf</span> for vibe-coded apps.
          </h1>
          <p className="mt-8 max-w-[52ch] text-pretty text-[17px] leading-relaxed text-paper-dim">
            A gallery for the software people make in an afternoon with an AI
            copilot and a pot of coffee. No code needed — just a screenshot, a
            link, and what you made it with.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <LinkButton href="/submit" variant="accent" size="lg" trailing={<ArrowGlyph />}>
              Shelve yours
            </LinkButton>
            <LinkButton href="#gallery" variant="ghost" size="lg">
              Browse the shelf
            </LinkButton>
          </div>
        </div>
        <aside className="col-span-12 lg:col-span-4">
          <div className="relative overflow-hidden rounded-2xl border border-paper/15 bg-ink-soft p-6">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-acid" />
            <div className="eyebrow mb-4">What gets in</div>
            <ul className="space-y-3 text-[14px] text-paper-dim">
              <Bullet>Anything you shipped — live URL required.</Bullet>
              <Bullet>Built mostly with AI tools. Cursor, Lovable, v0, Bolt, Claude Code, et al.</Bullet>
              <Bullet>Weird, small, useful, useless. All welcome.</Bullet>
              <Bullet>One screenshot or a short video clip is enough.</Bullet>
            </ul>
            <div className="rule-paper-dashed my-5 opacity-40" />
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim">
              <span>~2 min to submit</span>
              <span className="text-acid">No signup</span>
            </div>
          </div>
        </aside>
      </section>

      <Suspense fallback={null}>
        <Pulse />
      </Suspense>

      <Ticker />

      <div id="gallery" className="mt-16 scroll-mt-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="eyebrow">The gallery</div>
            <h2 className="display mt-2 text-[clamp(40px,6vw,72px)]">
              Currently on <em className="italic text-paper-dim">display</em>.
            </h2>
          </div>
        </div>
        <Suspense fallback={<GallerySkeleton />}>
          <Gallery />
        </Suspense>
      </div>

      <section className="mt-24">
        <div className="rule-paper-dashed mb-8 opacity-40" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <div className="eyebrow">Back issues</div>
            <h3 className="display mt-2 text-[clamp(28px,3.6vw,40px)]">
              The <em className="italic text-paper-dim">archive</em>.
            </h3>
          </div>
          <p className="max-w-[38ch] text-[14px] leading-relaxed text-paper-dim">
            The shelf resets every month. Past issues are kept in the stacks,
            editor&apos;s note and all.
          </p>
        </div>
        <ul className="mt-8 flex flex-wrap gap-3">
          {issues.map((iss) => {
            const n = shelfNumber(iss.year, iss.month);
            const isCur = iss.slug === cur.slug;
            return (
              <li key={iss.slug}>
                <Link
                  href={`/shelf/${iss.slug}`}
                  className={`group inline-flex items-center gap-2.5 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                    isCur
                      ? "border-acid bg-acid/10 text-acid"
                      : "border-paper/20 text-paper-dim hover:border-paper/50 hover:text-paper"
                  }`}
                >
                  <span className="text-[10px] opacity-70">№{String(n).padStart(2, "0")}</span>
                  <span>{issueLabel(iss)}</span>
                  {isCur && <span className="text-[9px]">· current</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="about" className="mt-32 scroll-mt-20">
        <div className="rule-paper-dashed mb-12 opacity-40" />
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-4">
            <div className="eyebrow">About the shelf</div>
            <h2 className="display mt-2 text-[clamp(36px,5vw,56px)]">
              A place for <em className="italic text-paper-dim">afternoon software</em>.
            </h2>
          </div>
          <div className="col-span-12 space-y-5 text-pretty text-[16px] leading-[1.7] text-paper-dim lg:col-span-7 lg:col-start-6">
            <p>
              Vibeshelf is a gallery for the small, strange, useful, and useless things
              people build in an afternoon with an AI copilot. It isn't a code host
              or a marketplace — just a <span className="text-paper">shelf</span> for
              what you made, who you are, and how you made it.
            </p>
            <p>
              We care about <span className="text-paper">taste</span>, not scale.
              A weekend build beside a year-long labour of love, both welcome, both
              judged by the same editorial eye. No badges, no streaks, no growth loops.
              Just a catalogue that feels good to browse.
            </p>
            <p>
              Bring a live URL, a screenshot, and the tools you leaned on. The rest is
              typography.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <LinkButton href="/submit" variant="accent" size="md" trailing={<ArrowGlyph />}>
                Shelve yours
              </LinkButton>
              <LinkButton href="#gallery" variant="ghost" size="md">
                Back to the gallery
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[360px] animate-pulse rounded-[14px] border border-paper/10 bg-ink-soft"
        />
      ))}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-[10px] inline-block h-[3px] w-5 flex-shrink-0 bg-paper-dim" />
      <span>{children}</span>
    </li>
  );
}
