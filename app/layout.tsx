import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";
import CursorRing from "@/components/CursorRing";
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
        <CursorRing />
        <CommandPalette />
        <Nav />
        <main>{children}</main>
        <footer className="container-page mt-32 pb-12">
          <div className="rule-paper-dashed mb-6" />
          <div className="flex flex-col gap-4 text-xs font-mono uppercase tracking-[0.22em] text-paper-dim md:flex-row md:items-center md:justify-between">
            <span>Vibeshelf · No code required · Est. 2026</span>
            <span className="flex items-center gap-3">
              <span>Press</span>
              <kbd className="rounded border border-paper/30 bg-ink-soft px-1.5 py-0.5 font-mono text-[10px] text-paper">⌘K</kbd>
              <span>to search anywhere</span>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
