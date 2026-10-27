import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Doctor, Settings } from "./types";

/**
 * Storage: Upstash Redis in production (Vercel Marketplace sets KV_REST_API_* or
 * UPSTASH_REDIS_REST_*), a local JSON file in development.
 */

const DOCTORS_KEY = "cg:doctors";
const SETTINGS_KEY = "cg:settings";

export const DEFAULT_SETTINGS: Settings = { videoUrl: "/images/invitation-video-new.mp4", eventTime: "" };

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Storage is not configured. Connect an Upstash Redis database to this Vercel project (Storage tab) and redeploy.",
    );
  }
}

interface Store {
  listDoctors(): Promise<Doctor[]>;
  getDoctor(slug: string): Promise<Doctor | null>;
  putDoctor(doctor: Doctor): Promise<void>;
  deleteDoctor(slug: string): Promise<void>;
  getSettings(): Promise<Settings>;
  putSettings(settings: Settings): Promise<void>;
}

function redisStore(redis: Redis): Store {
  return {
    async listDoctors() {
      const all = await redis.hgetall<Record<string, Doctor>>(DOCTORS_KEY);
      return Object.values(all ?? {});
    },
    async getDoctor(slug) {
      return (await redis.hget<Doctor>(DOCTORS_KEY, slug)) ?? null;
    },
    async putDoctor(doctor) {
      await redis.hset(DOCTORS_KEY, { [doctor.slug]: doctor });
    },
    async deleteDoctor(slug) {
      await redis.hdel(DOCTORS_KEY, slug);
    },
    async getSettings() {
      const s = await redis.get<Settings>(SETTINGS_KEY);
      return { ...DEFAULT_SETTINGS, ...(s ?? {}) };
    },
    async putSettings(settings) {
      await redis.set(SETTINGS_KEY, settings);
    },
  };
}

interface FileData {
  doctors: Record<string, Doctor>;
  settings: Settings;
}

function fileStore(): Store {
  const file = path.join(process.cwd(), ".data", "db.json");
  // Serialise writes so concurrent requests in dev don't clobber each other.
  let queue: Promise<unknown> = Promise.resolve();

  async function read(): Promise<FileData> {
    try {
      const raw = JSON.parse(await fs.readFile(file, "utf8")) as Partial<FileData>;
      return { doctors: raw.doctors ?? {}, settings: { ...DEFAULT_SETTINGS, ...raw.settings } };
    } catch {
      return { doctors: {}, settings: { ...DEFAULT_SETTINGS } };
    }
  }

  function mutate(fn: (data: FileData) => void): Promise<void> {
    const next = queue.then(async () => {
      const data = await read();
      fn(data);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(data, null, 2));
    });
    queue = next.catch(() => { });
    return next;
  }

  return {
    async listDoctors() {
      return Object.values((await read()).doctors);
    },
    async getDoctor(slug) {
      return (await read()).doctors[slug] ?? null;
    },
    putDoctor: (doctor) => mutate((d) => void (d.doctors[doctor.slug] = doctor)),
    deleteDoctor: (slug) => mutate((d) => void delete d.doctors[slug]),
    async getSettings() {
      return (await read()).settings;
    },
    putSettings: (settings) => mutate((d) => void (d.settings = settings)),
  };
}

let store: Store | null = null;

function getStore(): Store {
  if (store) return store;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    store = redisStore(new Redis({ url, token }));
  } else if (process.env.VERCEL) {
    // Vercel's filesystem is read-only and per-instance; a file store would silently lose data.
    throw new StorageNotConfiguredError();
  } else {
    store = fileStore();
  }
  return store;
}

export const db = {
  listDoctors: () => getStore().listDoctors(),
  getDoctor: (slug: string) => getStore().getDoctor(slug),
  putDoctor: (doctor: Doctor) => getStore().putDoctor(doctor),
  deleteDoctor: (slug: string) => getStore().deleteDoctor(slug),
  getSettings: () => getStore().getSettings(),
  putSettings: (settings: Settings) => getStore().putSettings(settings),
};
