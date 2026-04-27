import type { LlmId } from "./types";

export const LLMS: { id: LlmId; label: string; maker: string }[] = [
  { id: "gpt-4o",        label: "GPT-4o",              maker: "OpenAI" },
  { id: "gpt-5",         label: "GPT-5.5",             maker: "OpenAI" },
  { id: "o3",            label: "o3",                  maker: "OpenAI" },
  { id: "claude-sonnet", label: "Claude Sonnet 4.6",   maker: "Anthropic" },
  { id: "claude-opus",   label: "Claude Opus 4.7",     maker: "Anthropic" },
  { id: "gemini-pro",    label: "Gemini 3.1 Pro",      maker: "Google" },
  { id: "gemini-flash",  label: "Gemini 3.1 Flash",    maker: "Google" },
  { id: "llama-4",       label: "Llama 4 Maverick",    maker: "Meta" },
  { id: "deepseek-r1",   label: "DeepSeek R1",         maker: "DeepSeek" },
  { id: "deepseek-v3",   label: "DeepSeek V4",         maker: "DeepSeek" },
  { id: "grok",          label: "Grok 4.3",            maker: "xAI" },
  { id: "mistral",       label: "Mistral Small 4",     maker: "Mistral AI" },
  { id: "qwen",          label: "Qwen 3.6",            maker: "Alibaba" },
  { id: "phi-4",         label: "Phi-4",               maker: "Microsoft" },
  { id: "gemma",         label: "Gemma 4",             maker: "Google" },
];

export function llmLabel(id: LlmId): string {
  return LLMS.find((l) => l.id === id)?.label ?? id;
}
