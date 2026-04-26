"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/embed/")) return null;

  return (
    <footer className="container-page mt-32 pb-12">
      <div className="rule-paper-dashed mb-6" />
      <div className="flex flex-col gap-4 text-xs font-mono uppercase tracking-[0.22em] text-paper-dim md:flex-row md:items-center md:justify-between">
        <span>Vibeshelf · No code required · Est. 2026</span>
        <span className="hidden items-center gap-3 md:flex">
          <span>Press</span>
          <kbd className="rounded border border-paper/30 bg-ink-soft px-1.5 py-0.5 font-mono text-[10px] text-paper">⌘K</kbd>
          <span>to search anywhere</span>
        </span>
      </div>
    </footer>
  );
}
