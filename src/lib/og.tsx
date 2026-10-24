import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { EVENT } from "./event";

export const OG_SIZE = { width: 1200, height: 630 };

/** Social / WhatsApp preview card: the 3D heart on the right, the guest's name on the left. */
export async function renderInviteCard(name?: string) {
  // Literal paths so the bundler traces exactly these files.
  const [serif, sans, heart, logoSvg] = await Promise.all([
    readFile(path.join(process.cwd(), "assets", "DMSerifDisplay-Regular.ttf")),
    readFile(path.join(process.cwd(), "assets", "Oxygen-Regular.ttf")),
    readFile(path.join(process.cwd(), "assets", "og-heart.jpg")),
    readFile(path.join(process.cwd(), "public", "brand", "logo-light.svg"), "utf8"),
  ]);
  // resvg doesn't resolve CSS custom properties inside SVG fills.
  const logo = `data:image/svg+xml;base64,${Buffer.from(
    logoSvg.replace(/var\(--fill-0, ([^)]+)\)/g, "$1"),
  ).toString("base64")}`;
  const heartSrc = `data:image/jpeg;base64,${heart.toString("base64")}`;

  const display = name ? `Dr. ${name}` : "You're Invited";
  const nameSize = display.length > 24 ? 50 : display.length > 18 ? 60 : 72;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0b0302", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={heartSrc} width={720} height={720} style={{ position: "absolute", right: -70, top: -45 }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(90deg, #0b0302 0%, #0b0302 42%, rgba(11,3,2,0.6) 58%, rgba(11,3,2,0) 72%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
            width: 720,
            height: "100%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={logo} width={96} height={70} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Oxygen", fontSize: 18, letterSpacing: 6, color: "#9af8ff" }}>
              {name ? "A PERSONAL INVITATION FOR" : "BY INVITATION ONLY"}
            </div>
            <div style={{ fontFamily: "DM Serif", fontSize: nameSize, color: "#fffdf2", marginTop: 14, lineHeight: 1.05 }}>
              {display}
            </div>
            <div style={{ fontFamily: "Oxygen", fontSize: 26, color: "rgba(255,253,242,0.72)", marginTop: 22 }}>
              to the India launch of
            </div>
            <div style={{ display: "flex", fontFamily: "DM Serif", fontSize: 66, color: "#fffdf2", marginTop: 4 }}>
              MyCardio<span style={{ color: "#fd291b" }}>Gen</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Oxygen" }}>
            <div style={{ display: "flex", width: 120, height: 2, background: "#fd291b", marginBottom: 18 }} />
            <div style={{ fontSize: 24, color: "#fffdf2" }}>{EVENT.dateLong}</div>
            <div style={{ fontSize: 22, color: "rgba(255,253,242,0.6)", marginTop: 6 }}>{EVENT.venueFull}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "DM Serif", data: serif, style: "normal", weight: 400 },
        { name: "Oxygen", data: sans, style: "normal", weight: 400 },
      ],
    },
  );
}
