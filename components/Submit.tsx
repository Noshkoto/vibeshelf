"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, TOOLS } from "@/lib/tools";
import { LLMS } from "@/lib/llms";
import { ensureUniqueSlug, saveUserApp, slugify, uploadCover } from "@/lib/storage";
import type { AppEntry, CategoryId, CoverPalette, LlmId, ToolId } from "@/lib/types";
import AppCard from "./AppCard";
import { ArrowGlyph, Button, LinkButton } from "./Button";
import CoverArt from "./CoverArt";

const PALETTES: CoverPalette[] = [
  "citrus", "dusk", "menthol", "ember", "concrete", "bloom",
  "ocean", "saffron", "violet", "graphite", "lilac", "mint",
];
const MOTIFS: AppEntry["motif"][] = ["grid", "wave", "orbits", "stack", "glyph", "halftone"];

type Step = 0 | 1 | 2 | 3 | 4;

interface Draft {
  title: string;
  tagline: string;
  description: string;
  liveUrl: string;
  makerName: string;
  makerHandle: string;
  tools: ToolId[];
  llms: LlmId[];
  category: CategoryId;
  palette: CoverPalette;
  motif: AppEntry["motif"];
  coverFile?: File;
  coverPreviewUrl?: string;
}

const BLANK: Draft = {
  title: "",
  tagline: "",
  description: "",
  liveUrl: "",
  makerName: "",
  makerHandle: "",
  tools: [],
  llms: [],
  category: "creative",
  palette: "citrus",
  motif: "grid",
};

const STEPS: { n: Step; label: string; hint: string }[] = [
  { n: 0, label: "Cover", hint: "Drop a screenshot or pick a generated cover." },
  { n: 1, label: "Details", hint: "Title, one-liner, where it lives." },
  { n: 2, label: "Stack", hint: "What you built it with." },
  { n: 3, label: "Maker", hint: "Who shipped it." },
  { n: 4, label: "Review", hint: "Last look, then publish." },
];

export default function Submit() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [published, setPublished] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const update = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  useEffect(() => {
    return () => {
      if (draft.coverPreviewUrl) URL.revokeObjectURL(draft.coverPreviewUrl);
    };
  }, [draft.coverPreviewUrl]);

  const canAdvance = useMemo(() => {
    if (step === 0) return true; // covers are optional — we always have a generated one
    if (step === 1) return draft.title.trim().length > 0 && draft.tagline.trim().length > 0 && draft.liveUrl.trim().length > 0;
    if (step === 2) return draft.tools.length > 0;
    if (step === 3) return draft.makerName.trim().length > 0;
    return true;
  }, [step, draft]);

  const preview: AppEntry = useMemo(
    () => ({
      slug: slugify(draft.title || "untitled"),
      title: draft.title || "Untitled",
      tagline: draft.tagline || "A short, intriguing description of what it does.",
      description: draft.description || draft.tagline || "Tell the shelf what this is.",
      liveUrl: draft.liveUrl || "https://example.com",
      makerName: draft.makerName || "Anonymous maker",
      makerHandle: draft.makerHandle || undefined,
      tools: draft.tools.length ? draft.tools : ["cursor"],
      llms: draft.llms,
      category: draft.category,
      upvotes: 1,
      palette: draft.palette,
      motif: draft.motif,
      customCoverDataUrl: draft.coverPreviewUrl,
      createdAt: new Date().toISOString(),
    }),
    [draft]
  );

  async function publish() {
    if (publishing) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const base = slugify(draft.title || "untitled");
      const slug = await ensureUniqueSlug(base);
      let coverUrl: string | undefined;
      if (draft.coverFile) {
        const uploaded = await uploadCover(draft.coverFile);
        if (!uploaded) throw new Error("Cover upload failed — check your connection and try again.");
        coverUrl = uploaded;
      }
      const entry: AppEntry = {
        ...preview,
        slug,
        customCoverDataUrl: coverUrl,
      };
      const saved = await saveUserApp(entry);
      if (!saved) throw new Error("Couldn't save your app. Please try again.");
      setPublished(slug);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPublishing(false);
    }
  }

  if (published) {
    return (
      <div className="container-page py-24 text-center">
        <div className="eyebrow mb-4">Published</div>
        <h1 className="display mb-3 text-[clamp(56px,8vw,104px)] text-balance">
          On the shelf.
        </h1>
        <p className="mx-auto mb-10 max-w-[42ch] text-pretty text-[17px] text-paper-dim">
          Your app has been added to the gallery. Share the link, or put another one up.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <LinkButton href={`/app/${published}`} variant="accent" size="lg" trailing={<ArrowGlyph />}>
            See it live
          </LinkButton>
          <LinkButton href="/" variant="ghost" size="lg">
            Back to the gallery
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page pb-24 pt-6">
      <div className="mb-10 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="eyebrow mb-4">Shelve your app</div>
          <h1 className="display text-[clamp(48px,7vw,96px)] text-balance">
            Four quick questions.
          </h1>
          <p className="mt-4 max-w-[48ch] text-pretty text-[17px] text-paper-dim">
            No code upload. Just enough for people to find it, love it, and click through.
          </p>
        </div>
      </div>

      <Stepper step={step} onJump={(s) => setStep(s)} />

      <div className="mt-10 grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-7">
          {step === 0 && <CoverStep draft={draft} update={update} />}
          {step === 1 && <DetailsStep draft={draft} update={update} />}
          {step === 2 && <StackStep draft={draft} update={update} />}
          {step === 3 && <MakerStep draft={draft} update={update} />}
          {step === 4 && <ReviewStep draft={draft} />}

          <div className="mt-10 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => (Math.max(0, s - 1) as Step))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button
                variant="accent"
                disabled={!canAdvance}
                onClick={() => setStep((s) => (Math.min(4, s + 1) as Step))}
                trailing={<ArrowGlyph />}
              >
                Next · {STEPS[step + 1].label}
              </Button>
            ) : (
              <Button
                variant="accent"
                size="lg"
                onClick={publish}
                disabled={publishing}
                trailing={<ArrowGlyph />}
              >
                {publishing ? "Publishing…" : "Publish to the shelf"}
              </Button>
            )}
          </div>
          {publishError && (
            <div className="mt-4 rounded-[10px] border border-ember/40 bg-ember/[0.05] p-4 text-[13px] text-ember">
              {publishError}
            </div>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-5">
          <div className="sticky top-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="eyebrow">Live preview</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                updates as you type
              </span>
            </div>
            <div className="pointer-events-none">
              <AppCard app={preview} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stepper({ step, onJump }: { step: Step; onJump: (s: Step) => void }) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {STEPS.map((s) => {
        const done = s.n < step;
        const active = s.n === step;
        return (
          <li key={s.n}>
            <button
              onClick={() => onJump(s.n)}
              className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all ${
                active
                  ? "border-acid bg-acid text-ink"
                  : done
                  ? "border-paper/30 bg-paper/10 text-paper"
                  : "border-paper/15 text-paper-dim hover:border-paper/40 hover:text-paper"
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full border text-[9px] ${
                active ? "border-ink bg-ink text-acid" : done ? "border-paper/60" : "border-paper/30"
              }`}>
                {done ? "✓" : s.n + 1}
              </span>
              {s.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper">{label}</span>
        {hint && <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-paper/15 bg-ink-soft px-4 py-3 text-paper placeholder:text-paper-dim/60 transition-colors hover:border-paper/30 focus:border-acid focus:outline-none";

function CoverStep({ draft, update }: { draft: Draft; update: <K extends keyof Draft>(k: K, v: Draft[K]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (draft.coverPreviewUrl) URL.revokeObjectURL(draft.coverPreviewUrl);
    update("coverFile", file);
    update("coverPreviewUrl", URL.createObjectURL(file));
  }

  function removeCover() {
    if (draft.coverPreviewUrl) URL.revokeObjectURL(draft.coverPreviewUrl);
    update("coverFile", undefined);
    update("coverPreviewUrl", undefined);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow mb-2">Step 1 / 4</div>
        <h2 className="display text-[36px]">The cover.</h2>
        <p className="mt-2 max-w-[44ch] text-paper-dim">
          Drop in a screenshot of the app, or use one of our generated covers while you find the right shot.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 transition-colors ${
          drag ? "border-acid bg-acid/[0.04]" : "border-paper/20 hover:border-paper/40"
        }`}
        role="button"
        tabIndex={0}
      >
        {draft.coverPreviewUrl ? (
          <div className="flex items-start gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={draft.coverPreviewUrl} alt="" className="h-36 w-48 rounded-md object-cover ring-1 ring-paper/10" />
            <div>
              <div className="eyebrow mb-1">Screenshot attached</div>
              <p className="text-[14px] text-paper-dim">Click or drop a new one to replace. This will be used as the card cover.</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeCover();
                }}
                className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-dim hover:text-ember"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-paper/20 bg-ink">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-paper" aria-hidden>
                <path d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="square" />
              </svg>
            </div>
            <div className="display text-[22px]">Drop a screenshot</div>
            <p className="mt-1 text-[13px] text-paper-dim">or click to choose a file (PNG, JPG, WebP)</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>

      <div>
        <div className="eyebrow mb-3">Or pick a generated cover</div>
        <div className="grid grid-cols-4 gap-2">
          {PALETTES.map((p) => (
            <button
              key={p}
              onClick={() => update("palette", p)}
              className={`relative overflow-hidden rounded-md transition-transform hover:-translate-y-[2px] ${
                draft.palette === p ? "ring-2 ring-acid ring-offset-2 ring-offset-ink" : ""
              }`}
              style={{ aspectRatio: "5 / 4" }}
              aria-label={`Palette ${p}`}
            >
              <CoverArt palette={p} motif={draft.motif} title={draft.title || "Preview"} />
            </button>
          ))}
        </div>

        <div className="mt-6">
          <div className="eyebrow mb-3">Motif</div>
          <div className="flex flex-wrap gap-2">
            {MOTIFS.map((m) => (
              <button
                key={m}
                onClick={() => update("motif", m)}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  draft.motif === m
                    ? "border-acid bg-acid text-ink"
                    : "border-paper/20 text-paper-dim hover:border-paper/40 hover:text-paper"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailsStep({ draft, update }: { draft: Draft; update: <K extends keyof Draft>(k: K, v: Draft[K]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow mb-2">Step 2 / 4</div>
        <h2 className="display text-[36px]">The essentials.</h2>
        <p className="mt-2 max-w-[44ch] text-paper-dim">A name, a short line that makes someone click, and a live URL.</p>
      </div>

      <Field label="Title" hint="max 40 chars">
        <input
          className={inputCls}
          maxLength={40}
          placeholder="PomoPunk"
          value={draft.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </Field>

      <Field label="Tagline" hint="one line">
        <input
          className={inputCls}
          maxLength={120}
          placeholder="A cyberpunk pomodoro that rewards focus with neon skylines."
          value={draft.tagline}
          onChange={(e) => update("tagline", e.target.value)}
        />
      </Field>

      <Field label="Live URL" hint="must be live">
        <input
          className={inputCls}
          type="url"
          placeholder="https://pomopunk.example"
          value={draft.liveUrl}
          onChange={(e) => update("liveUrl", e.target.value)}
        />
      </Field>

      <Field label="Longer description" hint="optional">
        <textarea
          className={`${inputCls} min-h-[120px] resize-none`}
          maxLength={600}
          placeholder="What is it really? Why did you build it? What's weird or delightful about it?"
          value={draft.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <Field label="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => update("category", c.id)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                draft.category === c.id
                  ? "border-acid bg-acid text-ink"
                  : "border-paper/20 text-paper-dim hover:border-paper/40 hover:text-paper"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function StackStep({ draft, update }: { draft: Draft; update: <K extends keyof Draft>(k: K, v: Draft[K]) => void }) {
  function toggleTool(id: ToolId) {
    const has = draft.tools.includes(id);
    update("tools", has ? draft.tools.filter((t) => t !== id) : [...draft.tools, id]);
  }
  function toggleLlm(id: LlmId) {
    const has = draft.llms.includes(id);
    update("llms", has ? draft.llms.filter((l) => l !== id) : [...draft.llms, id]);
  }
  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow mb-2">Step 3 / 4</div>
        <h2 className="display text-[36px]">How'd you build it?</h2>
        <p className="mt-2 max-w-[44ch] text-paper-dim">
          Pick every tool that did real work. Honesty helps people find tools that match their taste.
        </p>
      </div>

      <div>
        <div className="eyebrow mb-3">Coding tool</div>
        <div className="flex flex-wrap gap-2">
          {TOOLS.map((t) => {
            const on = draft.tools.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTool(t.id)}
                className={`h-11 rounded-[10px] border px-4 font-mono text-[12px] uppercase tracking-[0.18em] transition-all ${
                  on
                    ? "border-ink bg-acid text-ink shadow-[3px_3px_0_0_#0B0B0A] -translate-y-[1px]"
                    : "border-paper/20 text-paper-dim hover:border-paper/50 hover:text-paper"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {draft.tools.length === 0 && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
            Select at least one tool to continue.
          </p>
        )}
      </div>

      <div className="rule-paper-dashed opacity-40" />

      <div>
        <div className="eyebrow mb-1">LLM · optional</div>
        <p className="mb-3 text-[13px] text-paper-dim">Which model(s) powered the project?</p>
        <div className="flex flex-wrap gap-2">
          {LLMS.map((l) => {
            const on = draft.llms.includes(l.id);
            return (
              <button
                key={l.id}
                onClick={() => toggleLlm(l.id)}
                className={`h-11 rounded-[10px] border px-4 font-mono text-[12px] uppercase tracking-[0.18em] transition-all ${
                  on
                    ? "border-ink bg-acid text-ink shadow-[3px_3px_0_0_#0B0B0A] -translate-y-[1px]"
                    : "border-paper/20 text-paper-dim hover:border-paper/50 hover:text-paper"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
        {draft.llms.length > 0 && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-dim">
            {draft.llms.map((id) => LLMS.find((l) => l.id === id)?.label).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

function MakerStep({ draft, update }: { draft: Draft; update: <K extends keyof Draft>(k: K, v: Draft[K]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow mb-2">Step 4 / 4</div>
        <h2 className="display text-[36px]">Who made it?</h2>
        <p className="mt-2 max-w-[44ch] text-paper-dim">So people can find you when they love what you made.</p>
      </div>

      <Field label="Maker name">
        <input
          className={inputCls}
          maxLength={60}
          placeholder="Kenji Yao"
          value={draft.makerName}
          onChange={(e) => update("makerName", e.target.value)}
        />
      </Field>

      <Field label="Handle" hint="optional">
        <input
          className={inputCls}
          maxLength={40}
          placeholder="@kenjiyao"
          value={draft.makerHandle}
          onChange={(e) => update("makerHandle", e.target.value)}
        />
      </Field>
    </div>
  );
}

function ReviewStep({ draft }: { draft: Draft }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow mb-2">Final review</div>
        <h2 className="display text-[36px]">Ready to shelve?</h2>
        <p className="mt-2 max-w-[44ch] text-paper-dim">
          This publishes to the gallery on this device. Looks right? Ship it.
        </p>
      </div>

      <div className="rounded-2xl border border-paper/15 bg-ink-soft p-6">
        <dl className="space-y-3 text-[14px]">
          <ReviewRow k="Title" v={draft.title || "—"} />
          <ReviewRow k="Tagline" v={draft.tagline || "—"} />
          <ReviewRow k="Live URL" v={draft.liveUrl || "—"} />
          <ReviewRow k="Category" v={CATEGORIES.find((c) => c.id === draft.category)?.label ?? "—"} />
          <ReviewRow
            k="Tools"
            v={draft.tools.length ? draft.tools.map((t) => TOOLS.find((x) => x.id === t)?.label).join(" · ") : "—"}
          />
          <ReviewRow
            k="LLMs"
            v={draft.llms.length ? draft.llms.map((l) => LLMS.find((x) => x.id === l)?.label).join(" · ") : "—"}
          />
          <ReviewRow k="Maker" v={`${draft.makerName || "—"}${draft.makerHandle ? ` · ${draft.makerHandle}` : ""}`} />
        </dl>
      </div>
    </div>
  );
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-paper/10 pb-3 last:border-none last:pb-0">
      <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-dim">{k}</dt>
      <dd className="max-w-[60%] text-right text-paper">{v}</dd>
    </div>
  );
}
