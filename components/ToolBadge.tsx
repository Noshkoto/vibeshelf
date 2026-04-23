import { toolLabel } from "@/lib/tools";
import type { ToolId } from "@/lib/types";

interface Props {
  tool: ToolId;
  tone?: "paper" | "ink";
  size?: "sm" | "md";
}

export default function ToolBadge({ tool, tone = "paper", size = "sm" }: Props) {
  const sizing = size === "md" ? "h-7 px-3 text-[11px]" : "h-6 px-2.5 text-[10px]";
  const tones =
    tone === "ink"
      ? "border-ink/60 text-ink bg-paper/60"
      : "border-paper/30 text-paper bg-transparent";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-[0.18em] ${sizing} ${tones}`}
    >
      <Dot tool={tool} tone={tone} />
      {toolLabel(tool)}
    </span>
  );
}

function Dot({ tool, tone }: { tool: ToolId; tone: "paper" | "ink" }) {
  // Each tool gets its own mark — a tiny glyph, not a color dot
  const base = tone === "ink" ? "#0B0B0A" : "#F4EAD5";
  const map: Record<ToolId, JSX.Element> = {
    cursor: (
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
        <path d="M1 1 L9 4 L4 5 L3 9 Z" fill={base} />
      </svg>
    ),
    lovable: (
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
        <path d="M5 9 C1 6 1 2 3 2 C4 2 5 3 5 4 C5 3 6 2 7 2 C9 2 9 6 5 9 Z" fill={base} />
      </svg>
    ),
    v0: (
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
        <rect x="1" y="1" width="8" height="8" fill="none" stroke={base} strokeWidth="1.6" />
      </svg>
    ),
    bolt: (
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
        <path d="M6 0 L1 6 L4 6 L3 10 L9 4 L6 4 Z" fill={base} />
      </svg>
    ),
    "claude-code": (
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
        <path d="M1 2 L4 5 L1 8 M5 8 H9" stroke={base} strokeWidth="1.4" fill="none" strokeLinecap="square" />
      </svg>
    ),
    "replit-agent": (
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
        <circle cx="5" cy="5" r="3.5" fill="none" stroke={base} strokeWidth="1.4" />
        <circle cx="5" cy="5" r="1" fill={base} />
      </svg>
    ),
    windsurf: (
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
        <path d="M1 5 Q3 3 5 5 T9 5" stroke={base} strokeWidth="1.4" fill="none" />
        <path d="M1 8 Q3 6 5 8 T9 8" stroke={base} strokeWidth="1.4" fill="none" />
      </svg>
    ),
    "claude-api": (
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
        <path d="M2 8 L5 2 L8 8 M3.5 6 H6.5" stroke={base} strokeWidth="1.4" fill="none" strokeLinecap="square" />
      </svg>
    ),
  };
  return map[tool];
}
