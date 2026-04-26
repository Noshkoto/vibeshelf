import { notFound } from "next/navigation";
import CoverArt from "@/components/CoverArt";
import ToolBadge from "@/components/ToolBadge";
import { fetchAppBySlug } from "@/lib/server";
import { categoryLabel } from "@/lib/tools";

export const revalidate = 300;

// Embed view — designed to drop into a 480x320 iframe on a maker's site.
// No nav, no footer, no command palette. Click anywhere to open the entry
// on vibeshelf.pro in the parent window.
export default async function EmbedPage({ params }: { params: { slug: string } }) {
  const app = await fetchAppBySlug(params.slug);
  if (!app) notFound();

  const href = `/app/${app.slug}`;

  return (
    <div className="min-h-[100dvh] bg-transparent p-3">
      <a
        href={href}
        target="_top"
        rel="noopener"
        className="group block overflow-hidden rounded-[14px] border border-paper/15 bg-ink-soft no-underline shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)]"
      >
        <div className="relative">
          {app.customCoverDataUrl ? (
            <div className="relative" style={{ aspectRatio: "5 / 3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={app.customCoverDataUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <CoverArt palette={app.palette} motif={app.motif} title={app.title} />
          )}
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-paper backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-acid" />
            On Vibeshelf
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
              {categoryLabel(app.category)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
              {app.makerHandle ?? app.makerName}
            </span>
          </div>
          <div className="display text-[22px] leading-[1.05] text-paper">{app.title}</div>
          <p className="mt-1 line-clamp-2 text-pretty text-[13px] leading-snug text-paper-dim">
            {app.tagline}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {app.tools.slice(0, 3).map((t) => (
              <ToolBadge key={t} tool={t} />
            ))}
            {app.tools.length > 3 && (
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                +{app.tools.length - 3}
              </span>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const app = await fetchAppBySlug(params.slug);
  return {
    title: app ? `${app.title} · embed` : "Embed",
    robots: { index: false, follow: false },
  };
}
