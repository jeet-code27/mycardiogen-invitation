/** "dr. anil  kapoor" -> "Anil Kapoor" */
export function cleanName(input: string): string {
  const stripped = input
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(dr\.?|doctor)\s+/i, "")
    .trim();
  // Only re-case names typed entirely in one case; respect deliberate casing like "McKenzie".
  const isSingleCase = stripped === stripped.toLowerCase() || stripped === stripped.toUpperCase();
  if (!isSingleCase) return stripped;
  return stripped
    .toLowerCase()
    .replace(/(^|[\s\-'.])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** "Anil Kapoor" -> "dr-anil-kapoor" */
export function slugify(name: string): string {
  const base = cleanName(name)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `dr-${base || "guest"}`;
}
