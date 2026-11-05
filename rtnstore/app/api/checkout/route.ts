import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, products, type OrderItem } from "@/db/schema";
import { getSessionUser, json } from "@/lib/admin";
import { newPaymentId } from "@/lib/catalog";
import { buildTelegramMessage, notifyBot, telegramLink } from "@/lib/telegram";

export const dynamic = "force-dynamic";

class StockError extends Error {}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return json({ error: "Please sign in to checkout" }, 401);

  const body = await req.json().catch(() => ({}));
  const raw: { id: number; qty: number }[] = Array.isArray(body.items) ? body.items : [];
  const wanted = new Map<number, number>();
  for (const i of raw) {
    const id = Number(i.id), qty = Math.floor(Number(i.qty));
    if (id > 0 && qty > 0) wanted.set(id, (wanted.get(id) ?? 0) + Math.min(qty, 50));
  }
  if (wanted.size === 0) return json({ error: "Your cart is empty" }, 400);

  const db = getDb();
  try {
    const order = await db.transaction(async (tx) => {
      const rows = await tx.select().from(products).where(inArray(products.id, [...wanted.keys()]));
      const items: OrderItem[] = [];
      for (const [id, qty] of wanted) {
        const p = rows.find((r) => r.id === id);
        if (!p || !p.active) throw new StockError("An item in your cart is no longer available");
        const updated = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${qty}`, updatedAt: new Date() })
          .where(and(eq(products.id, id), gte(products.stock, qty)))
          .returning({ id: products.id });
        if (updated.length === 0) throw new StockError(`Not enough stock for ${p.name} (only ${p.stock} left)`);
        items.push({ productId: id, name: p.name, type: p.type, qty, priceCents: p.priceCents });
      }
      const totalCents = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
      const [o] = await tx
        .insert(orders)
        .values({ paymentId: newPaymentId(), userId: user.userId, email: user.email, items, totalCents })
        .returning();
      return o;
    });

    const message = buildTelegramMessage({ ...order, kind: "order" });
    await notifyBot(message);
    return json({ paymentId: order.paymentId, totalCents: order.totalCents, telegramUrl: telegramLink(message) });
  } catch (e) {
    if (e instanceof StockError) return json({ error: e.message }, 409);
    console.error(e);
    return json({ error: "Checkout failed, please try again" }, 500);
  }
}
