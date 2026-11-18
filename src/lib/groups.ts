/**
 * Whose contact list a guest came from. Each list sends its own WhatsApp message.
 * Guests saved before lists existed have no `group`; they all belong to Dr. Anand's list.
 */
export const GROUPS = [
  { id: "anand", label: "Dr. Anand's contacts", short: "Dr. Anand" },
  { id: "ravinder", label: "Dr. Ravinder's contacts", short: "Dr. Ravinder" },
] as const;

export type GroupId = (typeof GROUPS)[number]["id"];

export function groupOf(d: { group?: string }): GroupId {
  return d.group === "ravinder" ? "ravinder" : "anand";
}

export function isGroupId(value: unknown): value is GroupId {
  return GROUPS.some((g) => g.id === value);
}

export function groupLabel(id: GroupId): string {
  return GROUPS.find((g) => g.id === id)!.label;
}
