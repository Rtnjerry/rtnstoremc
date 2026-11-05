import { getSessionUser, json } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await getSessionUser();
  return json({ signedIn: !!u, isAdmin: !!u?.isAdmin });
}
