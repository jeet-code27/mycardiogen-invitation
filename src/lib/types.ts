export type RsvpStatus = "attending" | "declined";

export interface Rsvp {
  status: RsvpStatus;
  guests: number;
  phone?: string;
  message?: string;
  respondedAt: string;
}

export interface Doctor {
  slug: string;
  /** Display name without the "Dr." prefix, e.g. "Anil Kapoor". */
  name: string;
  phone?: string;
  createdAt: string;
  firstOpenedAt?: string;
  lastOpenedAt?: string;
  openCount: number;
  rsvp?: Rsvp;
}

export interface Settings {
  /** YouTube, Vimeo or direct .mp4 URL. Empty shows the placeholder. */
  videoUrl: string;
  /** "HH:MM" (24h, IST). Empty hides the time and treats the event as all-day. */
  eventTime: string;
}

/** The subset of a doctor that is safe to send to the public invitation page. */
export interface PublicDoctor {
  slug: string;
  name: string;
  rsvp?: Pick<Rsvp, "status" | "guests">;
}
