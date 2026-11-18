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
  /** Name without any title, e.g. "Anil Kapoor". */
  name: string;
  /** "Mr.", "Mrs.", "Ms.", "Prof." or "" for none. Missing means "Dr." (the original default). */
  title?: string;
  phone?: string;
  createdAt: string;
  firstOpenedAt?: string;
  lastOpenedAt?: string;
  openCount: number;
  rsvp?: Rsvp;
  /** Invited as the event's Chief Guest; the invitation says so. */
  chiefGuest?: boolean;
  /** Whose contact list this guest is from (see lib/groups). Missing means Dr. Anand's. */
  group?: "ravinder";
  /** When the admin ticked "sent on WhatsApp". */
  sentAt?: string;
  /**
   * Created by an RSVP on the general (home page) invitation. `name` is then the full name
   * exactly as the guest typed it, which may or may not start with "Dr.".
   */
  viaGeneral?: boolean;
}

export interface Settings {
  /** YouTube, Vimeo or direct .mp4 URL. Empty shows the placeholder. */
  videoUrl: string;
  /** "HH:MM" (24h, IST). Empty hides the time and treats the event as all-day. */
  eventTime: string;
  /** WhatsApp message template with {name} and {link}; empty means the default message. */
  whatsappMessage: string;
  /** Message for Dr. Ravinder's contacts; empty falls back to `whatsappMessage`. */
  whatsappMessageRavinder: string;
}

/** The subset of a doctor that is safe to send to the public invitation page. */
export interface PublicDoctor {
  slug: string;
  /** Full name as addressed, title included ("Dr. Anil Kapoor"); empty for the general invitation. */
  name: string;
  chiefGuest?: boolean;
  rsvp?: Pick<Rsvp, "status" | "guests">;
}
