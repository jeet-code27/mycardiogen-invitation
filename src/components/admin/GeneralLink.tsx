"use client";

import { BellRing, Copy, ExternalLink, Globe } from "lucide-react";
import { REMINDER_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { card, ghostBtn, useToast } from "./ui";
import { copyText, whatsappMessage, whatsappUrl } from "./share";
import WhatsAppIcon from "./WhatsAppIcon";

/** One shareable link with Copy / WhatsApp / Preview. */
function LinkRow({
  Icon,
  tone,
  title,
  text,
  link,
  path,
  message,
  copied,
}: {
  Icon: typeof Globe;
  tone: string;
  title: string;
  text: string;
  link: string;
  path: string;
  message: string;
  copied: string;
}) {
  const toast = useToast();
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone}`}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-serif text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-cocoa/60">{text}</p>
          <p className="mt-2 truncate font-mono text-sm text-teal">{link.replace(/^https?:\/\//, "")}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          className={ghostBtn}
          onClick={async () => {
            if (await copyText(link)) toast(copied);
          }}
        >
          <Copy className="size-4" /> Copy
        </button>
        <a className={ghostBtn} target="_blank" rel="noopener noreferrer" href={whatsappUrl("", whatsappMessage(message, "", link))}>
          <WhatsAppIcon className="size-4 text-[#25D366]" /> WhatsApp
        </a>
        <a className={ghostBtn} target="_blank" rel="noopener noreferrer" href={path}>
          <ExternalLink className="size-4" /> Preview
        </a>
      </div>
    </div>
  );
}

const soFar = (n: number, one: string, many: string) => (n > 0 ? ` · ${n} ${n === 1 ? one : many} so far` : "");

/** The shareable links that work for anyone: the full home-page invitation and the short reminder. */
export default function GeneralLink({
  origin,
  responses,
  reminderResponses,
  messageTemplate,
}: {
  origin: string;
  responses: number;
  reminderResponses: number;
  messageTemplate: string;
}) {
  return (
    <div className={`${card} grid gap-6 p-5 sm:p-8`}>
      <LinkRow
        Icon={Globe}
        tone="bg-teal/10 text-teal"
        title="General invitation"
        text={`One link for anyone. Guests enter their own name when they RSVP${soFar(responses, "response", "responses")}.`}
        link={`${origin}/`}
        path="/"
        message={messageTemplate}
        copied="General link copied"
      />
      <div className="h-px bg-cocoa/10" />
      <LinkRow
        Icon={BellRing}
        tone="bg-brand/10 text-ember"
        title="Reminder page"
        text={`A short one-screen reminder. Guests tap Yes and leave their name and number; invited guests are matched by their number${soFar(reminderResponses, "reply", "replies")}.`}
        link={`${origin}/reminder`}
        path="/reminder"
        message={REMINDER_WHATSAPP_MESSAGE}
        copied="Reminder link copied"
      />
    </div>
  );
}
