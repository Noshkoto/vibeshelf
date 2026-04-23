import { ImageResponse } from "next/og";
import { fetchAppBySlug } from "@/lib/server";
import { PALETTES } from "@/lib/palette";
import { toolLabel } from "@/lib/tools";

export const runtime = "edge";
export const revalidate = 60;
export const alt = "A Vibeshelf entry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: { slug: string } }) {
  const app = await fetchAppBySlug(params.slug);

  if (!app) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0B0B0A",
            color: "#F4EAD5",
            fontSize: 72,
            fontFamily: "serif",
          }}
        >
          Not on the shelf.
        </div>
      ),
      { ...size }
    );
  }

  const p = PALETTES[app.palette] ?? PALETTES.citrus;
  const toolBadges = app.tools.slice(0, 4).map(toolLabel);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0B0B0A",
          fontFamily: "serif",
          color: "#F4EAD5",
        }}
      >
        <div
          style={{
            width: 480,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: p.bg,
            color: p.ink,
            padding: "56px 48px",
            borderRight: `1px solid rgba(0,0,0,0.12)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 18,
              letterSpacing: 5,
              textTransform: "uppercase",
              fontFamily: "monospace",
              color: p.ink,
              opacity: 0.75,
            }}
          >
            <span
              style={{
                display: "flex",
                width: 10,
                height: 10,
                borderRadius: 999,
                background: p.accent,
              }}
            />
            Shelf entry
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                fontSize: 88,
                lineHeight: 0.95,
                letterSpacing: -2,
                fontWeight: 600,
                fontStyle: "italic",
              }}
            >
              {app.title}
            </div>
            <div
              style={{
                height: 2,
                width: 96,
                background: p.accent,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 18,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: 3,
              color: p.ink,
              opacity: 0.7,
            }}
          >
            <span>by {app.makerName}</span>
            {app.makerHandle ? <span style={{ opacity: 0.6 }}>{app.makerHandle}</span> : null}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 72px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 18,
              letterSpacing: 5,
              textTransform: "uppercase",
              fontFamily: "monospace",
              color: "#C9BFA5",
            }}
          >
            <span
              style={{
                display: "flex",
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#D4FF3B",
              }}
            />
            Vibeshelf
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              paddingRight: 20,
            }}
          >
            <div
              style={{
                fontSize: 44,
                lineHeight: 1.12,
                letterSpacing: -0.5,
                color: "#F4EAD5",
              }}
            >
              {app.tagline}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {toolBadges.map((label) => (
                <span
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid rgba(244,234,213,0.35)",
                    borderRadius: 999,
                    padding: "8px 16px",
                    fontFamily: "monospace",
                    fontSize: 14,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "#F4EAD5",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontFamily: "monospace",
                fontSize: 14,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#C9BFA5",
              }}
            >
              <span>{app.upvotes.toLocaleString()} upvotes</span>
              <span style={{ color: "#F4EAD5" }}>vibeshelf.pro/app/{app.slug}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
