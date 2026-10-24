import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handler, jsonError } from "@/lib/api";

export const GET = handler(async () => NextResponse.json({ settings: await db.getSettings() }), {
  admin: true,
});

export const PUT = handler(
  async (req: Request) => {
    const body = (await req.json().catch(() => ({}))) as { videoUrl?: string; eventTime?: string };
    const videoUrl = String(body.videoUrl ?? "").trim();
    const eventTime = String(body.eventTime ?? "").trim();

    if (videoUrl && !/^https:\/\/\S+$/i.test(videoUrl)) {
      return jsonError("The video link must be a full https:// URL.", 400);
    }
    if (eventTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(eventTime)) {
      return jsonError("Event time must look like 19:00.", 400);
    }

    const settings = { videoUrl, eventTime };
    await db.putSettings(settings);
    return NextResponse.json({ settings });
  },
  { admin: true },
);
