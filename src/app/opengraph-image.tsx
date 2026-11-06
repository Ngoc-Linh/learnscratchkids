import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "ScratchKids - Học lập trình Scratch cho trẻ em";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #fff5e9 0%, #ffffff 52%, #eaf4ff 100%)",
          color: "#1e2a4a",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "6px solid #ffffff",
            borderRadius: 44,
            boxShadow: "0 24px 70px rgba(30, 42, 74, 0.16)",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: "64px 76px",
            width: "100%",
          }}
        >
          <div style={{ color: "#f28a20", display: "flex", fontSize: 34, fontWeight: 800 }}>
            {SITE.name}
          </div>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
            Học lập trình Scratch cho trẻ em
          </div>
          <div style={{ color: "#52617e", display: "flex", fontSize: 30 }}>
            Scratch cơ bản · Nâng cao · Python
          </div>
          <div style={{ color: "#52617e", display: "flex", fontSize: 24 }}>{SITE.url}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
