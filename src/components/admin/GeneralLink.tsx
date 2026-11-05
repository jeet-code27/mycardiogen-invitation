"use client";

import { Copy, ExternalLink, Globe } from "lucide-react";
import { card, ghostBtn, useToast } from "./ui";
import { copyText, generalWhatsappMessage, whatsappUrl } from "./share";
import WhatsAppIcon from "./WhatsAppIcon";

/** The shareable home-page invitation that works for anyone (they type their name when they RSVP). */
export default function GeneralLink({ origin, responses }: { origin: string; responses: number }) {
  const toast = useToast();
  const link = `${origin}/`;

  return (
    <div className={`${card} flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between`}>
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal/10 text-teal">
          <Globe className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-serif text-2xl">General invitation</h2>
          <p className="mt-1 text-sm text-cocoa/60">
            One link for anyone. Guests enter their own name when they RSVP
            {responses > 0 ? ` · ${responses} ${responses === 1 ? "response" : "responses"} so far` : ""}.
          </p>
          <p className="mt-2 truncate font-mono text-sm text-teal">{link.replace(/^https?:\/\//, "")}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          className={ghostBtn}
          onClick={async () => {
            if (await copyText(link)) toast("General link copied");
          }}
        >
          <Copy className="size-4" /> Copy
        </button>
        <a className={ghostBtn} target="_blank" rel="noopener noreferrer" href={whatsappUrl("", generalWhatsappMessage(link))}>
          <WhatsAppIcon className="size-4 text-[#25D366]" /> WhatsApp
        </a>
        <a className={ghostBtn} target="_blank" rel="noopener noreferrer" href="/">
          <ExternalLink className="size-4" /> Preview
        </a>
      </div>
    </div>
  );
}
