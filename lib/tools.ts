import type { CategoryId, ToolId } from "./types";

export const TOOLS: { id: ToolId; label: string }[] = [
  { id: "cursor", label: "Cursor" },
  { id: "lovable", label: "Lovable" },
  { id: "v0", label: "v0" },
  { id: "bolt", label: "Bolt" },
  { id: "claude-code", label: "Claude Code" },
  { id: "replit-agent", label: "Replit Agent" },
  { id: "windsurf", label: "Windsurf" },
  { id: "claude-api", label: "Claude API" },
];

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "productivity", label: "Productivity" },
  { id: "games", label: "Games" },
  { id: "ai", label: "AI" },
  { id: "creative", label: "Creative" },
  { id: "dev-tools", label: "Dev Tools" },
  { id: "social", label: "Social" },
];

export function toolLabel(id: ToolId): string {
  return TOOLS.find((t) => t.id === id)?.label ?? id;
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
