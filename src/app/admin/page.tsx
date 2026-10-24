import type { Metadata } from "next";
import { credentialsConfigured, isAdmin } from "@/lib/auth";
import { db, DEFAULT_SETTINGS, StorageNotConfiguredError } from "@/lib/db";
import type { Doctor, Settings } from "@/lib/types";
import LoginForm from "@/components/admin/LoginForm";
import Dashboard from "@/components/admin/Dashboard";

export const metadata: Metadata = { title: "Invitation Console · MyCardioGen" };

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm configured={credentialsConfigured()} />;

  let doctors: Doctor[] = [];
  let settings: Settings = DEFAULT_SETTINGS;
  let storageError = "";
  try {
    [doctors, settings] = await Promise.all([db.listDoctors(), db.getSettings()]);
  } catch (err) {
    if (!(err instanceof StorageNotConfiguredError)) throw err;
    storageError = err.message;
  }

  return (
    <Dashboard
      initialDoctors={doctors.sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
      initialSettings={settings}
      storageError={storageError}
    />
  );
}
