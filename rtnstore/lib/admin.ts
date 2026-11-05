import { auth, currentUser } from "@clerk/nextjs/server";

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getSessionUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const emails = (user?.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());
  const allowed = adminEmails();
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
