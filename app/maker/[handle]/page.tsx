import type { Metadata } from "next";
import MakerBoot from "@/components/MakerBoot";
import { fetchAppsByMaker } from "@/lib/server";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const handle = decodeURIComponent(params.handle);
  const apps = await fetchAppsByMaker(handle);

  if (apps.length === 0) {
    return {
      title: `No shelf for ${handle}`,
      description: "This maker hasn't shelved anything yet.",
    };
  }

  const withHandle = apps.find((a) => a.makerHandle);
  const name = apps[0].makerName;
  const displayHandle = withHandle?.makerHandle;
  const titles = apps.slice(0, 3).map((a) => a.title).join(", ");
  const description = `${apps.length} ${apps.length === 1 ? "entry" : "entries"} on the shelf: ${titles}${apps.length > 3 ? "…" : "."}`;
  const canonical = `/maker/${encodeURIComponent(handle)}`;

  return {
    title: displayHandle ? `${name} (${displayHandle})` : name,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${name} on Vibeshelf`,
      description,
      url: canonical,
      type: "profile",
      siteName: "Vibeshelf",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} on Vibeshelf`,
      description,
      creator: displayHandle,
    },
  };
}

export default function MakerPage({ params }: { params: { handle: string } }) {
  return <MakerBoot handle={decodeURIComponent(params.handle)} />;
}
