export type LlmId =
  | "gpt-4o"
  | "gpt-5"
  | "o3"
  | "claude-sonnet"
  | "claude-opus"
  | "gemini-pro"
  | "gemini-flash"
  | "llama-4"
  | "deepseek-r1"
  | "deepseek-v3"
  | "grok"
  | "mistral"
  | "qwen"
  | "phi-4"
  | "gemma";

export type ToolId =
  | "hermes"
  | "openclaw"
  | "claude-code"
  | "codex"
  | "cursor"
  | "lovable"
  | "v0"
  | "bolt"
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
  llms?: LlmId[];
  createdAt: string;
}
