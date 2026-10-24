"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, LoaderCircle, User } from "lucide-react";
import Logo from "@/components/Logo";

export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    configured ? "" : "Admin login is not configured yet. Set ADMIN_USERNAME and ADMIN_PASSWORD.",
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-cocoa/15 bg-white py-3 pr-4 pl-11 text-cocoa placeholder:text-cocoa/35 focus:border-teal focus:ring-4 focus:ring-teal/15 focus:outline-none";

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-cream px-6 text-cocoa">
      <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[520px] rounded-full bg-teal/15 blur-3xl" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-[28px] border border-cocoa/10 bg-white/80 p-8 shadow-[0_30px_80px_-30px_rgba(47,15,3,0.35)] backdrop-blur-xl sm:p-10"
      >
        <Logo variant="dark" className="h-12 w-auto" />
        <h1 className="mt-6 font-serif text-3xl">Invitation Console</h1>
        <p className="mt-1 text-sm text-cocoa/60">MyCardioGen India Launch · Admin</p>

        <label className="relative mt-8 block">
          <span className="sr-only">Admin ID</span>
          <User className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cocoa/40" />
          <input
            className={field}
            placeholder="Admin ID"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className="relative mt-3 block">
          <span className="sr-only">Password</span>
          <KeyRound className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cocoa/40" />
          <input
            className={`${field} pr-12`}
            type={show ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 text-cocoa/40 hover:text-cocoa"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </label>

        {error && <p className="mt-4 text-sm text-ember">{error}</p>}

        <button
          type="submit"
          disabled={busy || !configured}
          className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a1a] to-ember py-3.5 font-bold text-white shadow-[0_10px_30px_-10px_rgba(253,41,27,0.9)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <LoaderCircle className="size-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </main>
  );
}
