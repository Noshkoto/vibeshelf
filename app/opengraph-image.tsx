import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vibeshelf — a showcase for vibe-coded apps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0B0A",
          padding: "72px 80px",
          color: "#F4EAD5",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#C9BFA5",
          }}
        >
          <span
            style={{
              display: "flex",
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#D4FF3B",
              boxShadow: "0 0 24px rgba(212,255,59,0.7)",
            }}
          />
          Vibeshelf · Shelf №1
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 132, lineHeight: 1, letterSpacing: -2, fontWeight: 600 }}>
            The shelf for
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: -2,
              fontWeight: 600,
            }}
          >
            <span style={{ fontStyle: "italic", color: "#D4FF3B" }}>vibe-coded</span>
            <span>&nbsp;apps.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#C9BFA5",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          <span>Cursor · Lovable · v0 · Claude Code · Bolt</span>
          <span style={{ color: "#F4EAD5" }}>vibeshelf.pro</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
