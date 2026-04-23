"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, TOOLS } from "@/lib/tools";
import { getAllApps } from "@/lib/storage";
import type { AppEntry, CategoryId, ToolId } from "@/lib/types";
import AppCard from "./AppCard";

type Sort = "trending" | "recent";

const TOOL_IDS = new Set(TOOLS.map((t) => t.id));
const CAT_IDS = new Set(CATEGORIES.map((c) => c.id));

function parseTool(v: string | null): ToolId | "all" {
  return v && TOOL_IDS.has(v as ToolId) ? (v as ToolId) : "all";
}
function parseCat(v: string | null): CategoryId | "all" {
  return v && CAT_IDS.has(v as CategoryId) ? (v as CategoryId) : "all";
}
function parseSort(v: string | null): Sort {
  return v === "recent" ? "recent" : "trending";
}

export default function Gallery() {
  const router = useRouter();
  const params = useSearchParams();

  const [apps, setApps] = useState<AppEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tool, setTool] = useState<ToolId | "all">(() => parseTool(params.get("tool")));
  const [cat, setCat] = useState<CategoryId | "all">(() => parseCat(params.get("cat")));
  const [sort, setSort] = useState<Sort>(() => parseSort(params.get("sort")));
  const [q, setQ] = useState<string>(() => params.get("q") ?? "");
  const hydrated = useRef(false);

  useEffect(() => {
    let active = true;
    getAllApps().then((list) => {
      if (!active) return;
      setApps(list);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setTool(parseTool(params.get("tool")));
    setCat(parseCat(params.get("cat")));
    setSort(parseSort(params.get("sort")));
    setQ(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    const qs = new URLSearchParams();
    if (tool !== "all") qs.set("tool", tool);
    if (cat !== "all") qs.set("cat", cat);
    if (sort !== "trending") qs.set("sort", sort);
    if (q.trim()) qs.set("q", q.trim());
    const s = qs.toString();
    const next = `${window.location.pathname}${s ? `?${s}` : ""}#gallery`;
    window.history.replaceState(null, "", next);
  }, [tool, cat, sort, q]);

  const filtered = useMemo(() => {
    let list = apps;
    if (tool !== "all") list = list.filter((a) => a.tools.includes(tool));
    if (cat !== "all") list = list.filter((a) => a.category === cat);
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter((a) =>
        [a.title, a.tagline, a.description, a.makerName, a.makerHandle ?? ""]
          .some((s) => s.toLowerCase().includes(needle))
      );
    }
    if (sort === "trending") list = [...list].sort((a, b) => b.upvotes - a.upvotes);
    else list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return list;
  }, [apps, tool, cat, sort, q]);

  function clearFilters() {
    setTool("all");
    setCat("all");
    setSort("trending");
    setQ("");
  }

  const hasFilters = tool !== "all" || cat !== "all" || sort !== "trending" || q.trim().length > 0;

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-[clamp(20px,4vw,48px)] mb-8 border-b border-paper/10 bg-ink/80 px-[clamp(20px,4vw,48px)] py-4 backdrop-blur">
        <div className="mb-3 flex items-center gap-3">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 16 16"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-dim"
              aria-hidden
            >
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles, taglines, makers…"
              className="w-full rounded-full border border-paper/15 bg-ink-soft py-2 pl-9 pr-4 text-[14px] text-paper placeholder:text-paper-dim/60 transition-colors hover:border-paper/30 focus:border-acid focus:outline-none"
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim transition-colors hover:text-ember"
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <FilterGroup label="Built with">
              <Chip active={tool === "all"} onClick={() => setTool("all")}>
                All tools
              </Chip>
              {TOOLS.map((t) => (
                <Chip key={t.id} active={tool === t.id} onClick={() => setTool(t.id)}>
                  {t.label}
                </Chip>
              ))}
            </FilterGroup>
          </div>
          <div className="flex items-center gap-2">
            <FilterGroup label="Sort">
              <Chip active={sort === "trending"} onClick={() => setSort("trending")}>
                Trending
              </Chip>
              <Chip active={sort === "recent"} onClick={() => setSort("recent")}>
                Newest
              </Chip>
            </FilterGroup>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FilterGroup label="Category">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>
              All
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
                {c.label}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      </div>

      <div className="mb-6 flex items-baseline justify-between">
        <div className="eyebrow">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </div>
        <div className="eyebrow">
          {tool === "all" ? "All tools" : TOOLS.find((t) => t.id === tool)?.label} ·{" "}
          {cat === "all" ? "All categories" : CATEGORIES.find((c) => c.id === cat)?.label}
        </div>
      </div>

      {!loaded ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[360px] animate-pulse rounded-[14px] border border-paper/10 bg-ink-soft"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-paper/20 p-10 text-center">
          <div className="display text-3xl">Nothing on this shelf yet.</div>
          <div className="text-paper-dim">Try another filter or be the first to shelve something.</div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-acid hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, i) => (
            <AppCard key={a.slug} app={a} index={i} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex h-7 items-center rounded-full border px-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-all ${
        active
          ? "border-acid bg-acid text-ink shadow-[2px_2px_0_0_#0B0B0A]"
          : "border-paper/20 text-paper-dim hover:border-paper/50 hover:text-paper"
      }`}
    >
      {children}
    </button>
  );
}
