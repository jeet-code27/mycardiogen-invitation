/**
 * Which contact list / category a guest belongs to. There are built-in lists, and the admin can
 * type any other category ("Other"), stored as its name. Guests with no `group` are Dr. Anand's
 * (everyone added before lists existed).
 */
export const PRESET_GROUPS = [
  { id: "anand", label: "Dr. Anand's contacts", short: "Dr. Anand" },
  { id: "ravinder", label: "Dr. Ravinder's contacts", short: "Dr. Ravinder" },
  { id: "influencer", label: "Insta influencer", short: "Insta influencer" },
] as const;

/** The lists that have their own WhatsApp message; every other list uses Dr. Anand's. */
export const MESSAGE_GROUPS = PRESET_GROUPS.slice(0, 2);

export type Group = { id: string; label: string; short: string };

export function groupOf(d: { group?: string }): string {
  return d.group?.trim() || "anand";
}

export function groupLabel(id: string): string {
  return PRESET_GROUPS.find((g) => g.id === id)?.label ?? id;
}

export function groupShort(id: string): string {
  return PRESET_GROUPS.find((g) => g.id === id)?.short ?? id;
}

/**
 * Cleans a submitted list for storage: Dr. Anand's list is stored as `undefined`, a typed name
 * matching a built-in list becomes that list, anything else is kept as a trimmed name.
 * Returns null when the value isn't usable.
 */
export function normalizeGroup(value: unknown): string | undefined | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (text.length > 40) return null;
  const preset = PRESET_GROUPS.find(
    (g) => [g.id, g.label, g.short].some((v) => v.toLowerCase() === text.toLowerCase()),
  );
  const id = preset?.id ?? text;
  return id === "anand" ? undefined : id;
}

/** Built-in lists plus every custom category already in use, for pickers and filters. */
export function allGroups(doctors: { group?: string; viaGeneral?: boolean }[]): Group[] {
  const custom = [
    ...new Set(doctors.filter((d) => !d.viaGeneral).map(groupOf)),
  ].filter((id) => !PRESET_GROUPS.some((g) => g.id === id));
  return [
    ...PRESET_GROUPS,
    ...custom.sort((a, b) => a.localeCompare(b)).map((id) => ({ id, label: id, short: id })),
  ];
}
