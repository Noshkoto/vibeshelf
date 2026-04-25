"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";
const STORAGE_KEY = "vibeshelf-theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") root.classList.add("light");
  else root.classList.remove("light");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore write failures (private mode, quota, etc.)
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const isLight = theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Switch to night edition" : "Switch to day edition"}
      onClick={toggle}
      className="group relative flex h-8 w-[72px] shrink-0 items-center rounded-full border border-paper/25 bg-ink-soft/80 px-1 transition-colors hover:border-paper/50"
    >
      {/* Sliding indicator dot — sits under whichever icon is "current" */}
      <span
        aria-hidden
        className="absolute top-1 left-1 h-6 w-[32px] rounded-full bg-acid transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          transform: mounted && isLight ? "translateX(32px)" : "translateX(0)",
          boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.2), 0 1px 0 rgb(var(--color-ink))",
        }}
      />
      <span
        aria-hidden
        className={`relative z-10 flex h-6 w-[32px] items-center justify-center transition-colors ${
          !mounted || !isLight ? "text-ink" : "text-paper-dim"
        }`}
      >
        <MoonGlyph />
      </span>
      <span
        aria-hidden
        className={`relative z-10 flex h-6 w-[32px] items-center justify-center transition-colors ${
          mounted && isLight ? "text-ink" : "text-paper-dim"
        }`}
      >
        <SunGlyph />
      </span>
    </button>
  );
}

function MoonGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-[13px] w-[13px]" aria-hidden>
      <path
        d="M12.5 9.2A5 5 0 0 1 6.8 3.5a.5.5 0 0 0-.7-.6A6.2 6.2 0 1 0 13.1 9.9a.5.5 0 0 0-.6-.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-[14px] w-[14px]" aria-hidden>
      <circle cx="8" cy="8" r="3" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M8 1.5v1.6" />
        <path d="M8 12.9v1.6" />
        <path d="M1.5 8h1.6" />
        <path d="M12.9 8h1.6" />
        <path d="M3.4 3.4l1.1 1.1" />
        <path d="M11.5 11.5l1.1 1.1" />
        <path d="M3.4 12.6l1.1-1.1" />
        <path d="M11.5 4.5l1.1-1.1" />
      </g>
    </svg>
  );
}
