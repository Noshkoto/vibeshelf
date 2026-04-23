"use client";

import { useEffect, useState } from "react";
import { hasUpvoted, toggleUpvote } from "@/lib/storage";

export default function UpvoteButton({
  slug,
  initial,
}: {
  slug: string;
  initial: number;
}) {
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(initial);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCount(initial);
  }, [initial]);

  useEffect(() => {
    let active = true;
    hasUpvoted(slug).then((v) => {
      if (active) setUpvoted(v);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  async function onClick() {
    if (pending) return;
    setPending(true);
    // optimistic
    const nextUpvoted = !upvoted;
    setUpvoted(nextUpvoted);
    setCount((c) => c + (nextUpvoted ? 1 : -1));
    try {
      const confirmed = await toggleUpvote(slug);
      if (confirmed !== nextUpvoted) {
        // server said something different — reconcile
        setUpvoted(confirmed);
        setCount((c) => c + (confirmed === nextUpvoted ? 0 : confirmed ? 1 : -1));
      }
    } catch {
      // roll back
      setUpvoted(!nextUpvoted);
      setCount((c) => c - (nextUpvoted ? 1 : -1));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={onClick}
      aria-pressed={upvoted}
      disabled={pending}
      className={`group inline-flex h-14 items-center gap-3 rounded-[12px] border px-5 font-mono text-[12px] uppercase tracking-[0.18em] transition-all ${
        upvoted
          ? "border-ink bg-acid text-ink shadow-offset"
          : "border-paper/20 bg-ink-soft text-paper hover:border-paper/40"
      } ${pending ? "opacity-70" : ""}`}
    >
      <svg viewBox="0 0 12 12" className={`h-4 w-4 transition-transform ${upvoted ? "scale-110" : "group-hover:-translate-y-[1px]"}`} aria-hidden>
        <path d="M6 1 L11 6 L8 6 L8 11 L4 11 L4 6 L1 6 Z" fill="currentColor" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
      </svg>
      <span className="tabular-nums">{count}</span>
      <span className="opacity-60">{upvoted ? "shelved" : "shelve it"}</span>
    </button>
  );
}
