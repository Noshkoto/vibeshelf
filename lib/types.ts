export type ToolId =
  | "cursor"
  | "lovable"
  | "v0"
  | "bolt"
  | "claude-code"
  | "replit-agent"
  | "windsurf"
  | "claude-api";

export type CategoryId =
  | "productivity"
  | "games"
  | "ai"
  | "creative"
  | "dev-tools"
  | "social";

export type CoverPalette =
  | "citrus"
  | "dusk"
  | "menthol"
  | "ember"
  | "concrete"
  | "bloom"
  | "ocean"
  | "saffron"
  | "violet"
  | "graphite"
  | "lilac"
  | "mint";

export interface AppEntry {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  liveUrl: string;
  makerName: string;
  makerHandle?: string;
  tools: ToolId[];
  category: CategoryId;
  upvotes: number;
  palette: CoverPalette;
  motif: "grid" | "wave" | "orbits" | "stack" | "glyph" | "halftone";
  customCoverDataUrl?: string;
  createdAt: string;
  seeded?: boolean;
}
