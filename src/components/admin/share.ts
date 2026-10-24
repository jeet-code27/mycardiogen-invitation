import { EVENT } from "@/lib/event";

export function inviteLink(origin: string, slug: string) {
  return `${origin}/${slug}`;
}

export function whatsappMessage(name: string, link: string) {
  return [
    `Dear Dr. ${name},`,
    "",
    "It is our privilege to invite you to the India launch of *MyCardioGen* — A Paradigm Shift in Preventive Heart Screening.",
    "",
    `📅 ${EVENT.dateLong}`,
    `📍 ${EVENT.venueFull}`,
    "",
    "Your personal invitation:",
    link,
    "",
    "Warm regards,",
    "Dr. Anand Singla & Dr. Sonam Chouksey",
  ].join("\n");
}

/** wa.me link; a 10-digit Indian mobile gets the +91 country code. */
export function whatsappUrl(phone: string | undefined, text: string) {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}
