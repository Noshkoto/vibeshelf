import type { CoverPalette } from "@/lib/types";
import { PALETTES } from "@/lib/palette";

type Motif = "grid" | "wave" | "orbits" | "stack" | "glyph" | "halftone";

interface Props {
  palette: CoverPalette;
  motif: Motif;
  title: string;
  tagline?: string;
  variant?: "card" | "hero";
  className?: string;
}

export default function CoverArt({ palette, motif, title, tagline, variant = "card", className }: Props) {
  const c = PALETTES[palette];
  const isHero = variant === "hero";
  const aspect = isHero ? "4 / 3" : "5 / 4";
  const size = isHero ? 800 : 400;

  return (
    <div
      className={`relative isolate overflow-hidden ${className ?? ""}`}
      style={{ aspectRatio: aspect, background: c.bg, color: c.ink }}
    >
      <Motif motif={motif} colors={c} size={size} />

      {/* Ticker tape across the top */}
      <div
        className="absolute inset-x-0 top-0 flex items-center gap-4 border-b px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em]"
        style={{ borderColor: c.ink, color: c.ink, background: `${c.bg}` }}
      >
        <span>{isHero ? "// live shelf" : "// shelf"}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.accent }} />
        <span className="opacity-70">no · {Math.floor(Math.random() * 99).toString().padStart(2, "0")}</span>
      </div>

      {/* Title lockup */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-10">
        <div
          className="display font-black leading-[0.88] text-balance"
          style={{ color: c.ink, fontSize: isHero ? "clamp(48px, 6vw, 96px)" : "clamp(28px, 4.5vw, 44px)" }}
        >
          {title}
        </div>
        {tagline && isHero && (
          <div
            className="mt-4 max-w-[40ch] font-mono text-[11px] uppercase tracking-[0.22em] opacity-80"
            style={{ color: c.ink }}
          >
            {tagline}
          </div>
        )}
      </div>

      {/* Corner accent */}
      <div
        className="absolute right-3 top-[38px] h-2 w-2 rounded-full"
        style={{ background: c.accent, boxShadow: `0 0 0 3px ${c.bg}` }}
      />
    </div>
  );
}

function Motif({
  motif,
  colors,
  size,
}: {
  motif: Motif;
  colors: { bg: string; ink: string; accent: string; shadow: string };
  size: number;
}) {
  const { ink, accent, shadow } = colors;

  if (motif === "grid") {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <pattern id="gp" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M0 0H28V28" fill="none" stroke={ink} strokeOpacity="0.18" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gp)" />
        <g opacity="0.75">
          <rect x={size * 0.55} y={size * 0.2} width={size * 0.28} height={size * 0.28} fill={accent} stroke={ink} strokeWidth="2" />
          <rect x={size * 0.6} y={size * 0.25} width={size * 0.28} height={size * 0.28} fill={shadow} stroke={ink} strokeWidth="2" />
        </g>
      </svg>
    );
  }

  if (motif === "wave") {
    return (
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d={`M0 ${80 + i * 22} Q100 ${40 + i * 22} 200 ${80 + i * 22} T400 ${80 + i * 22}`}
            fill="none"
            stroke={ink}
            strokeOpacity={0.18 + i * 0.02}
            strokeWidth={1.2}
          />
        ))}
        <circle cx="320" cy="120" r="48" fill={accent} stroke={ink} strokeWidth="2" />
      </svg>
    );
  }

  if (motif === "orbits") {
    return (
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {[0.22, 0.36, 0.5].map((r, i) => (
          <ellipse
            key={i}
            cx="200"
            cy="200"
            rx={400 * r}
            ry={400 * r * 0.55}
            fill="none"
            stroke={ink}
            strokeOpacity="0.28"
            strokeWidth="1.2"
            transform={`rotate(${-12 - i * 6} 200 200)`}
          />
        ))}
        <circle cx="200" cy="200" r="32" fill={ink} />
        <circle cx="290" cy="160" r="10" fill={accent} stroke={ink} strokeWidth="2" />
        <circle cx="130" cy="240" r="6" fill={shadow} stroke={ink} strokeWidth="1.5" />
      </svg>
    );
  }

  if (motif === "stack") {
    return (
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {Array.from({ length: 7 }).map((_, i) => (
          <rect
            key={i}
            x={60 + i * 8}
            y={70 + i * 14}
            width={260}
            height={20}
            fill={i % 2 === 0 ? shadow : accent}
            stroke={ink}
            strokeWidth="1.2"
            opacity={0.9 - i * 0.08}
          />
        ))}
      </svg>
    );
  }

  if (motif === "glyph") {
    return (
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <circle cx="200" cy="200" r="110" fill="none" stroke={ink} strokeWidth="1.4" strokeDasharray="4 6" />
        <path d="M120 200 L200 110 L280 200 L200 290 Z" fill={accent} stroke={ink} strokeWidth="2" />
        <circle cx="200" cy="200" r="18" fill={ink} />
        <path d="M60 60 L120 60 M340 340 L280 340 M60 340 L60 280 M340 60 L340 120" stroke={ink} strokeWidth="1.4" />
      </svg>
    );
  }

  // halftone
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      <defs>
        <radialGradient id="ht" cx="70%" cy="30%" r="70%">
          <stop offset="0%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#ht)" opacity="0.8" />
      <g fill={ink}>
        {Array.from({ length: 16 }).map((_, y) =>
          Array.from({ length: 16 }).map((_, x) => {
            const dx = x - 11;
            const dy = y - 6;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const r = Math.max(0.4, 5 - dist * 0.35);
            return <circle key={`${x}-${y}`} cx={12 + x * 24} cy={12 + y * 24} r={r} />;
          })
        )}
      </g>
    </svg>
  );
}
