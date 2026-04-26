"use client";

import { useEffect, useRef, useState } from "react";
import type { AppEntry } from "@/lib/types";
import { toolLabel } from "@/lib/tools";

type Variant = "compact" | "panel";

interface Props {
  app: AppEntry;
  variant?: Variant;
  onClose?: () => void;
}

// Twitter/X intent URL — the URL param is what unfurls into the OG card.
function tweetUrl(text: string, url: string) {
  const params = new URLSearchParams({ text, url });
  return `https://x.com/intent/tweet?${params.toString()}`;
}

function siteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://vibeshelf.pro";
}

export default function ShareDialog({ app, variant = "panel" }: Props) {
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const origin = siteOrigin();
  const permalink = `${origin}/app/${app.slug}`;
  const embedSrc = `${origin}/embed/${app.slug}`;
  const tools = app.tools.map(toolLabel).slice(0, 3).join(", ");
  const tweetText = `Just shelved "${app.title}" on Vibeshelf — built with ${tools || "AI tools"}.`;
  const embedSnippet = `<iframe src="${embedSrc}" width="480" height="320" frameborder="0" loading="lazy" title="${app.title} on Vibeshelf"></iframe>`;

  function copy(kind: "link" | "embed", text: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 1600);
    });
  }

  const compact = variant === "compact";

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-2"
          : "rounded-2xl border border-paper/15 bg-ink-soft p-5"
      }
    >
      {!compact && (
        <div className="mb-4 flex items-baseline justify-between">
          <div className="eyebrow">Share this entry</div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
            opens with a card preview
          </span>
        </div>
      )}

      <div className={compact ? "flex flex-wrap items-center gap-2" : "flex flex-wrap gap-2"}>
        <a
          href={tweetUrl(tweetText, permalink)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-paper/20 bg-ink px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-paper transition-colors hover:border-acid hover:text-acid"
        >
          <XGlyph />
          Post to X
        </a>
        <button
          onClick={() => copy("link", permalink)}
          className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-paper/20 bg-ink px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-dim transition-colors hover:border-paper/50 hover:text-paper"
        >
          <LinkGlyph />
          {copied === "link" ? "Link copied" : "Copy link"}
        </button>
        <button
          onClick={() => copy("embed", embedSnippet)}
          className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-paper/20 bg-ink px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-dim transition-colors hover:border-paper/50 hover:text-paper"
        >
          <EmbedGlyph />
          {copied === "embed" ? "Embed copied" : "Copy embed"}
        </button>
      </div>

      {!compact && (
        <pre className="mt-4 overflow-x-auto rounded-[10px] border border-paper/10 bg-ink p-3 font-mono text-[11px] text-paper-dim">
{embedSnippet}
        </pre>
      )}
    </div>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M11.5 1.5h2.3l-5 5.7 5.9 7.3h-4.6l-3.6-4.7-4.1 4.7H0l5.4-6.1L0 1.5h4.7l3.3 4.4 3.5-4.4Zm-.8 11.7h1.3L4.6 2.8H3.2l7.5 10.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M6.5 9.5l3-3M5 11l-1 1a2.5 2.5 0 01-3.5-3.5l2-2A2.5 2.5 0 016 5.5M11 5l1-1a2.5 2.5 0 013.5 3.5l-2 2A2.5 2.5 0 0110 10.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmbedGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
