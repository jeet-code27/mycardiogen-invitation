export type ParsedVideo =
  | { kind: "iframe"; src: string; thumb?: string }
  | { kind: "file"; src: string; thumb?: string };

const DEFAULT_VIDEO_SRC = "/images/invitation-video.mp4";
const DEFAULT_VIDEO_THUMB = "/images/video-thumbnail.jpeg";

/** Turns a pasted YouTube / Vimeo / Google Drive / .mp4 link or local file into something playable. */
export function parseVideo(url?: string | null): ParsedVideo | null {
  const raw = (url ?? "").trim() || DEFAULT_VIDEO_SRC;
  if (!raw) return null;

  // Local file or relative path
  if (raw.startsWith("/") || raw.startsWith("./") || /\.(mp4|webm|mov|m4v)$/i.test(raw)) {
    return {
      kind: "file",
      src: raw,
      thumb: DEFAULT_VIDEO_THUMB,
    };
  }

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return {
      kind: "file",
      src: raw,
      thumb: DEFAULT_VIDEO_THUMB,
    };
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtu.be" || host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const id =
      host === "youtu.be"
        ? u.pathname.slice(1)
        : (u.searchParams.get("v") ?? u.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1]);
    if (id) {
      return {
        kind: "iframe",
        src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        thumb: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      };
    }
  }

  if (host.endsWith("vimeo.com")) {
    const id = u.pathname.match(/(\d{6,})/)?.[1];
    if (id) return { kind: "iframe", src: `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0` };
  }

  if (host === "drive.google.com") {
    const id = u.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ?? u.searchParams.get("id");
    if (id) return { kind: "iframe", src: `https://drive.google.com/file/d/${id}/preview` };
  }

  if (/\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) {
    return { kind: "file", src: raw, thumb: DEFAULT_VIDEO_THUMB };
  }

  return { kind: "iframe", src: raw };
}
