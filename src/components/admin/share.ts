import { fillMessage } from "@/lib/whatsapp";

export function inviteLink(origin: string, slug: string) {
  return `${origin}/${slug}`;
}

/** The admin's message template filled in for one guest (or for the general link, without a name). */
export function whatsappMessage(template: string, name: string, link: string) {
  return fillMessage(template, { name, link });
}

/**
 * WhatsApp share link; a 10-digit Indian mobile gets the +91 country code. Uses
 * api.whatsapp.com rather than wa.me, whose redirect turns emojis like 📅 into "�".
 */
export function whatsappUrl(phone: string | undefined, text: string) {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  const to = digits ? `phone=${digits}&` : "";
  return `https://api.whatsapp.com/send?${to}text=${encodeURIComponent(text)}`;
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
