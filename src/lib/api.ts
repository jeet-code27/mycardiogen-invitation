import { NextResponse } from "next/server";
import { isAdmin } from "./auth";
import { StorageNotConfiguredError } from "./db";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Wraps a route handler: optional admin guard plus friendly storage/unknown errors. */
export function handler<A extends unknown[]>(
  fn: (...args: A) => Promise<Response>,
  opts: { admin?: boolean } = {},
) {
  return async (...args: A): Promise<Response> => {
    try {
      if (opts.admin && !(await isAdmin())) return jsonError("Unauthorized", 401);
      return await fn(...args);
    } catch (err) {
      if (err instanceof StorageNotConfiguredError) return jsonError(err.message, 503);
      console.error(err);
      return jsonError("Something went wrong. Please try again.", 500);
    }
  };
}
