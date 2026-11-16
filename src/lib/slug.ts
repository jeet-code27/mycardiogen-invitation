/** Titles a guest can be addressed with. "" means no title (e.g. a friend or colleague). */
export const TITLES = ["Dr.", "Mr.", "Mrs.", "Ms.", "Prof.", ""] as const;

// Order matters only for readability; each pattern requires a space after the title.
const TITLE_PATTERNS: [RegExp, string][] = [
  [/^(dr|doctor)\.?\s+/i, "Dr."],
  [/^mrs\.?\s+/i, "Mrs."],
  [/^mr\.?\s+/i, "Mr."],
  [/^ms\.?\s+/i, "Ms."],
  [/^miss\s+/i, "Miss"],
  [/^(prof|professor)\.?\s+/i, "Prof."],
  [/^shri\.?\s+/i, "Shri"],
  [/^smt\.?\s+/i, "Smt."],
];

/** "mr.  bipin gupta" -> { title: "Mr.", rest: "bipin gupta" } */
function splitTitle(input: string): { title?: string; rest: string } {
  const text = input.replace(/\s+/g, " ").trim();
  for (const [re, title] of TITLE_PATTERNS) {
    if (re.test(text)) return { title, rest: text.replace(re, "").trim() };
  }
  return { rest: text };
}

/** "dr. anil  kapoor" -> "Anil Kapoor" (any title is removed) */
export function cleanName(input: string): string {
  const stripped = splitTitle(input).rest;
  // Only re-case names typed entirely in one case; respect deliberate casing like "McKenzie".
  const isSingleCase = stripped === stripped.toLowerCase() || stripped === stripped.toUpperCase();
  if (!isSingleCase) return stripped;
  return stripped
    .toLowerCase()
    .replace(/(^|[\s\-'.])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** "Mr. Bipin Gupta" -> { title: "Mr.", name: "Bipin Gupta" }; a typed title wins over the default. */
export function parseGuest(input: string, defaultTitle = "Dr."): { title: string; name: string } {
  const { title } = splitTitle(input);
  return { title: title ?? defaultTitle, name: cleanName(input) };
}

/**
 * How a guest is addressed: "Dr. Anil Kapoor", "Mr. Bipin Gupta", or just "Debanjan Purkayastha".
 * Records without a title are doctors (everyone was, before titles existed). General-link guests
 * keep the name exactly as they typed it.
 */
export function displayName(d: { name: string; title?: string; viaGeneral?: boolean }): string {
  if (d.viaGeneral) return d.name;
  const title = d.title ?? "Dr.";
  return title ? `${title} ${d.name}` : d.name;
}

/** ("Anil Kapoor", "Dr.") -> "dr-anil-kapoor"; ("Debanjan Purkayastha", "") -> "debanjan-purkayastha" */
export function slugify(name: string, title = "Dr."): string {
  const base = cleanName(name)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const prefix = title.toLowerCase().replace(/[^a-z]/g, "");
  return [prefix, base || "guest"].filter(Boolean).join("-");
}
