"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAllApps } from "@/lib/storage";
import { TOOLS, CATEGORIES, toolLabel } from "@/lib/tools";
import type { AppEntry } from "@/lib/types";

type Item =
  | { kind: "action"; id: string; label: string; hint: string; run: () => void }
  | { kind: "app"; id: string; label: string; hint: string; app: AppEntry; run: () => void }
  | { kind: "filter"; id: string; label: string; hint: string; run: () => void };

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const [apps, setApps] = useState<AppEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "/" && !open) {
        const t = e.target as HTMLElement | null;
        const editing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
        if (!editing) {
          e.preventDefault();
          setOpen(true);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    getAllApps().then((list) => {
      if (active) setApps(list);
    });
    setQ("");
    setCursor(0);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const actions: Item[] = [
      {
        kind: "action",
        id: "go-submit",
        label: "Shelve a new app",
        hint: "Open the submit form",
        run: () => router.push("/submit"),
      },
      {
        kind: "action",
        id: "go-home",
        label: "Browse the gallery",
        hint: "Jump to the shelf",
        run: () => router.push("/#gallery"),
      },
    ];

    const filterItems: Item[] = TOOLS.map((t) => ({
      kind: "filter" as const,
      id: `filter-${t.id}`,
      label: `Built with ${t.label}`,
      hint: "Filter the gallery",
      run: () => router.push(`/?tool=${t.id}#gallery`),
    }));

    const appItems: Item[] = apps.map((a) => ({
      kind: "app" as const,
      id: `app-${a.slug}`,
      label: a.title,
      hint: a.tagline,
      app: a,
      run: () => router.push(`/app/${a.slug}`),
    }));

    const all = [...actions, ...filterItems, ...appItems];
    const query = q.toLowerCase().trim();
    if (!query) {
      return [...actions, ...appItems.slice(0, 6)];
    }
    return all
      .filter((it) => {
        if (it.label.toLowerCase().includes(query)) return true;
        if (it.hint.toLowerCase().includes(query)) return true;
        if (it.kind === "app" && it.app.tools.some((t) => toolLabel(t).toLowerCase().includes(query))) return true;
        if (it.kind === "app" && CATEGORIES.find((c) => c.id === it.app.category)?.label.toLowerCase().includes(query))
          return true;
        return false;
      })
      .slice(0, 12);
  }, [apps, q, router]);

  useEffect(() => {
    if (cursor >= items.length) setCursor(Math.max(0, items.length - 1));
  }, [items, cursor]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(items.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      const it = items[cursor];
      if (it) {
        it.run();
        setOpen(false);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-start justify-center bg-ink/70 px-4 pt-[14vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[680px] animate-fade-in-up overflow-hidden rounded-[16px] border border-paper/20 bg-ink-soft shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-paper/15 px-5 py-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim">⌘K</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search the shelf, jump to a tool, shelve a new one…"
            className="flex-1 bg-transparent text-[16px] outline-none placeholder:text-paper-dim/60"
          />
          <kbd className="hidden rounded border border-paper/20 bg-ink px-1.5 py-0.5 font-mono text-[10px] text-paper-dim md:inline-block">
            esc
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto px-2 py-2">
          {items.length === 0 && (
            <div className="px-4 py-8 text-center text-paper-dim">No matches — try a different word.</div>
          )}
          {groupBy(items).map((group) => (
            <div key={group.kind} className="px-3 py-2">
              <div className="eyebrow mb-2 px-2">{group.title}</div>
              {group.items.map((it) => {
                const idx = items.indexOf(it);
                const active = idx === cursor;
                return (
                  <button
                    key={it.id}
                    onMouseEnter={() => setCursor(idx)}
                    onClick={() => {
                      it.run();
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left transition-colors ${
                      active ? "bg-paper/[0.06] text-paper" : "text-paper-dim hover:text-paper"
                    }`}
                  >
                    <Glyph kind={it.kind} active={active} />
                    <span className={`flex-1 truncate text-[14px] ${active ? "text-paper" : ""}`}>{it.label}</span>
                    <span className="hidden truncate text-[12px] text-paper-dim md:inline-block md:max-w-[50%]">
                      {it.hint}
                    </span>
                    <span
                      className={`ml-2 font-mono text-[10px] uppercase tracking-[0.2em] ${
                        active ? "text-acid" : "text-paper-dim/40"
                      }`}
                    >
                      ↵
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-paper/15 bg-ink px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
          <span>
            ↑↓ navigate · ↵ open · <kbd className="mx-1 rounded border border-paper/20 px-1">esc</kbd> close
          </span>
          <span>
            press <kbd className="mx-1 rounded border border-paper/20 px-1">/</kbd> anywhere
          </span>
        </div>
      </div>
    </div>
  );
}

function Glyph({ kind, active }: { kind: Item["kind"]; active: boolean }) {
  const color = active ? "#D4FF3B" : "#C9BFA5";
  if (kind === "app") {
    return (
      <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" aria-hidden>
        <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke={color} strokeWidth="1.2" />
        <path d="M3 5h6M3 8h4" stroke={color} strokeWidth="1.2" />
      </svg>
    );
  }
  if (kind === "filter") {
    return (
      <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" aria-hidden>
        <path d="M1 2h10M3 6h6M5 10h2" stroke={color} strokeWidth="1.4" strokeLinecap="square" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" aria-hidden>
      <path d="M6 2v8M2 6h8" stroke={color} strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

function groupBy(items: Item[]) {
  const groups: { kind: string; title: string; items: Item[] }[] = [];
  const titles: Record<string, string> = {
    action: "Quick actions",
    filter: "Filters",
    app: "Apps on the shelf",
  };
  for (const it of items) {
    const title = titles[it.kind] ?? it.kind;
    let g = groups.find((x) => x.title === title);
    if (!g) {
      g = { kind: it.kind, title, items: [] };
      groups.push(g);
    }
    g.items.push(it);
  }
  return groups;
}
