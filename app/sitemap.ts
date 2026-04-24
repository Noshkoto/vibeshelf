import type { MetadataRoute } from "next";
import { allIssues } from "@/lib/editorial";
import { fetchAllApps, makerKey } from "@/lib/server";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibeshelf.pro";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const apps = await fetchAllApps();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/submit`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const appRoutes: MetadataRoute.Sitemap = apps.map((a) => ({
    url: `${SITE_URL}/app/${a.slug}`,
    lastModified: a.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const issueRoutes: MetadataRoute.Sitemap = allIssues().map((iss) => ({
    url: `${SITE_URL}/shelf/${iss.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const makerKeys = Array.from(new Set(apps.map(makerKey).filter(Boolean)));
  const makerRoutes: MetadataRoute.Sitemap = makerKeys.map((key) => ({
    url: `${SITE_URL}/maker/${encodeURIComponent(key)}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...appRoutes, ...issueRoutes, ...makerRoutes];
}
