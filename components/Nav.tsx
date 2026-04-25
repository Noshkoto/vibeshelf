"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowGlyph, LinkButton } from "./Button";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <header className="relative z-10">
      <div className="container-page flex items-center justify-between gap-4 py-6">
        <Link href="/" className="group flex items-center gap-3">
          <Mark />
          <div className="flex flex-col leading-none">
            <span className="display text-[22px] text-paper">Vibeshelf</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper-dim mt-1">
              shelved with taste
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className={`font-mono text-[12px] uppercase tracking-[0.2em] transition-colors ${
              onHome ? "text-paper" : "text-paper-dim hover:text-paper"
            }`}
          >
            Gallery
          </Link>
          <a
            href="#about"
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-paper-dim hover:text-paper"
          >
            About
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LinkButton href="/submit" variant="accent" size="sm" trailing={<ArrowGlyph />}>
            Shelve yours
          </LinkButton>
        </div>
      </div>
      <div className="rule-paper-dashed container-page opacity-60" />
    </header>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 44 44" className="h-9 w-9" aria-hidden>
      <rect
        x="1"
        y="1"
        width="42"
        height="42"
        rx="9"
        className="fill-paper stroke-ink"
        strokeWidth="1.2"
      />
      <rect x="6" y="14" width="32" height="3" className="fill-ink" />
      <rect x="6" y="23" width="32" height="3" className="fill-ink" />
      <rect x="6" y="32" width="22" height="3" className="fill-ink" />
      <circle
        cx="33"
        cy="33.5"
        r="3"
        className="fill-acid stroke-ink"
        strokeWidth="1.2"
      />
    </svg>
  );
}
