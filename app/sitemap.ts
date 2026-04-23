import type { MetadataRoute } from "next";
import { SEED_APPS } from "@/lib/seed";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibeshelf.pro";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/submit`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const seedRoutes: MetadataRoute.Sitemap = SEED_APPS.map((a) => ({
    url: `${SITE_URL}/app/${a.slug}`,
    lastModified: a.createdAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...seedRoutes];
}
