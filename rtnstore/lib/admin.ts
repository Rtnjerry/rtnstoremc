import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { admins } from "@/db/schema";

export const DEFAULT_ADMIN_EMAILS = [
  "domauff757@gmail.com",
  "rtnjerry27@gmail.com",
  "rathanakny2006@gmail.com",
];

export function envAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

let tableEnsured = false;
export async function ensureAdminsTable() {
  if (tableEnsured) return;
  try {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "admins" (
        "id" serial PRIMARY KEY,
        "email" text NOT NULL UNIQUE,
        "added_by" text DEFAULT 'system' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    for (const email of DEFAULT_ADMIN_EMAILS) {
      await db
        .insert(admins)
        .values({ email, addedBy: "system" })
        .onConflictDoNothing();
    }
    tableEnsured = true;
  } catch {
    // Graceful fallback during build time or without active DB
  }
}

export async function getAdminEmails(): Promise<string[]> {
  const allowed = new Set<string>([...DEFAULT_ADMIN_EMAILS, ...envAdminEmails()]);
  try {
    await ensureAdminsTable();
    const db = getDb();
    const rows = await db.select({ email: admins.email }).from(admins);
    for (const r of rows) {
      if (r.email) allowed.add(r.email.trim().toLowerCase());
    }
  } catch {
    // fallback to env + defaults
  }
  return Array.from(allowed);
}

export function adminEmails(): string[] {
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envAdminEmails()]));
}

export async function getSessionUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const emails = (user?.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());
  const allowed = await getAdminEmails();
  return {
    userId,
    email: user?.primaryEmailAddress?.emailAddress ?? emails[0] ?? "",
    name: user?.fullName || "",
    isAdmin: emails.some((e) => allowed.includes(e)),
  };
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user?.isAdmin) return null;
  return user;
}

export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
