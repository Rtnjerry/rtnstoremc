import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { validPrice } from "@/lib/catalog";
import { json, requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return json({ error: "Admins only" }, 403);
  const id = Number((await ctx.params).id);
  const b = await req.json().catch(() => ({}));
  const db = getDb();
  const [current] = await db.select().from(products).where(eq(products.id, id));
  if (!current) return json({ error: "Not found" }, 404);

  const update: Partial<typeof products.$inferInsert> = { updatedAt: new Date() };
  if (b.name !== undefined) update.name = String(b.name).trim() || current.name;
  if (b.description !== undefined) update.description = String(b.description);
  if (b.image !== undefined) update.image = String(b.image).startsWith("/") ? String(b.image) : current.image;
  if (b.badge !== undefined) update.badge = String(b.badge);
  if (b.active !== undefined) update.active = Boolean(b.active);
  if (b.price !== undefined) {
    const cents = Math.round(Number(b.price) * 100);
    if (!validPrice(current.type, cents))
      return json({ error: current.type === "cape" ? "Cape price must be $0.99–$9.99" : "Account price must be $9.99–$49.99" }, 400);
    update.priceCents = cents;
  }
  if (b.stock !== undefined) update.stock = Math.max(0, Math.floor(Number(b.stock)));

  if (b.stockDelta !== undefined) {
    const d = Math.floor(Number(b.stockDelta));
    const [row] = await db
      .update(products)
      .set({ ...update, stock: sql`greatest(0, ${products.stock} + ${d})` })
      .where(eq(products.id, id))
      .returning();
    return json(row);
  }
  const [row] = await db.update(products).set(update).where(eq(products.id, id)).returning();
  return json(row);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return json({ error: "Admins only" }, 403);
  const id = Number((await ctx.params).id);
  await getDb().delete(products).where(eq(products.id, id));
  return json({ ok: true });
}
