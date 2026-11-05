import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { json, requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return json({ error: "Admins only" }, 403);
  return json(await getDb().select().from(orders).orderBy(desc(orders.id)).limit(50));
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return json({ error: "Admins only" }, 403);
  const b = await req.json().catch(() => ({}));
  const status = String(b.status);
  if (!["pending", "paid", "redeemed", "cancelled"].includes(status)) return json({ error: "Bad status" }, 400);
  const [row] = await getDb().update(orders).set({ status }).where(eq(orders.id, Number(b.id))).returning();
  return json(row);
}
