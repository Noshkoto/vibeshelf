import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailBoot from "@/components/DetailBoot";
import { fetchAppBySlug } from "@/lib/server";
import { toolLabel } from "@/lib/tools";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const app = await fetchAppBySlug(params.slug);
  if (!app) {
    return {
      title: "App not found",
      description: "This shelf entry has either been taken down or never existed.",
    };
  }

  const toolList = app.tools.map(toolLabel).join(" · ");
  const title = `${app.title} — ${app.tagline}`;
  const description = app.description || app.tagline;
  const canonical = `/app/${app.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${app.title} · Vibeshelf`,
      description,
      url: canonical,
      type: "article",
      siteName: "Vibeshelf",
      authors: [app.makerName],
      tags: [toolList, app.category],
    },
    twitter: {
      card: "summary_large_image",
      title: `${app.title} · Vibeshelf`,
      description,
      creator: app.makerHandle,
    },
  };
}

export default async function AppDetailPage({ params }: { params: { slug: string } }) {
  const app = await fetchAppBySlug(params.slug);
  if (!app) notFound();
  return <DetailBoot slug={params.slug} initialApp={app} />;
}
