import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibeshelf.pro";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vibeshelf — a showcase for vibe-coded apps",
    template: "%s · Vibeshelf",
  },
  description:
    "A gallery of applications built by vibe coders. Bring your Cursor, Lovable, v0, Bolt, and Claude Code apps to the shelf.",
  openGraph: {
    title: "Vibeshelf — a showcase for vibe-coded apps",
    description:
      "A gallery for software made in an afternoon with an AI copilot. No code uploads — just a screenshot, a link, and what you made it with.",
    url: SITE_URL,
    siteName: "Vibeshelf",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibeshelf — a showcase for vibe-coded apps",
    description:
      "A gallery for software made in an afternoon with an AI copilot.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

// Runs before React hydration so the theme is applied before first paint —
// prevents the flash-of-wrong-theme that happens if you set the class from
// a useEffect. Reads localStorage, falls back to prefers-color-scheme.
const THEME_BOOT = `(function(){try{var s=localStorage.getItem('vibeshelf-theme');var p=window.matchMedia('(prefers-color-scheme: light)').matches;var t=s||(p?'light':'dark');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <CommandPalette />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
