import type { Metadata } from "next";
import Submit from "@/components/Submit";

export const metadata: Metadata = {
  title: "Shelve yours",
  description:
    "Submit an app to Vibeshelf. No code uploads — just a screenshot, a live URL, and what you built it with.",
  alternates: { canonical: "/submit" },
  openGraph: {
    title: "Shelve yours · Vibeshelf",
    description:
      "A gallery for the software people make in an afternoon with an AI copilot. Bring a live URL.",
    url: "/submit",
    type: "website",
    siteName: "Vibeshelf",
  },
};

export default function SubmitPage() {
  return <Submit />;
}
