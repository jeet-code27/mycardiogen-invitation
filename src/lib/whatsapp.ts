/**
 * The WhatsApp message the admin sends with each invitation. It is editable in the admin
 * settings; `{name}` becomes the guest's name and `{link}` their invitation link.
 */
export const DEFAULT_WHATSAPP_MESSAGE = `You’re invited to the India launch of MyCardioGen, an evening hosted by Dr. Anand Singla, CEO & Founder; Harvard-trained interventional cardiologist from the USA, and Dr. Sonam Chouksey, Longevity expert and Chief Innovation Officer.

In Indians, heart risk often starts earlier and runs in families, and a routine checkup can miss it. MyCardioGen is one screening built for Indians to detect that and alert them.

📅 Saturday, 28 November 2026
📍 Le Méridien, Windsor Place, New Delhi, 7:30 PM

Please open your invitation and RSVP here:
{link}`;

/** Sent with the /reminder page link from the admin. */
export const REMINDER_WHATSAPP_MESSAGE = `A gentle reminder: you are invited to the launch of MyCardioGen.

📅 Saturday, 28 November 2026, 7:30 PM
📍 Le Méridien, Windsor Place, New Delhi

We would be delighted to have you with us. Please confirm your attendance here:
{link}`;

/** Fills a message template. Without a name (general link), lines that use {name} are dropped. */
export function fillMessage(template: string, { name, link }: { name: string; link: string }): string {
  let text = (template.trim() || DEFAULT_WHATSAPP_MESSAGE).replace(/\r\n/g, "\n");
  if (!name) text = text.split("\n").filter((line) => !line.includes("{name}")).join("\n").trim();
  text = text.replaceAll("{name}", name);
  // The link must always go out, even if someone deletes {link} from the template.
  return text.includes("{link}") ? text.replaceAll("{link}", link) : `${text}\n\n${link}`;
}

/** The template for a contact list: Dr. Ravinder's own message if written, else the main one. */
export function templateFor(
  settings: { whatsappMessage: string; whatsappMessageRavinder: string },
  group: string,
): string {
  return (group === "ravinder" && settings.whatsappMessageRavinder.trim()) || settings.whatsappMessage;
}
