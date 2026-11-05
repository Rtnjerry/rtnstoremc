import { and, eq, gt, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, products, redeemCodes } from "@/db/schema";
import { getSessionUser, json } from "@/lib/admin";
import { newPaymentId } from "@/lib/catalog";
import { buildTelegramMessage, notifyBot, telegramLink } from "@/lib/telegram";

export const dynamic = "force-dynamic";

class RedeemError extends Error {}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return json({ error: "Please sign in to redeem a code" }, 401);
  const code = String((await req.json().catch(() => ({}))).code ?? "").trim().toUpperCase();
  if (!code) return json({ error: "Enter a code" }, 400);

  try {
    const order = await getDb().transaction(async (tx) => {
      const used = await tx
        .update(redeemCodes)
        .set({ usesLeft: sql`${redeemCodes.usesLeft} - 1` })
        .where(and(eq(redeemCodes.code, code), gt(redeemCodes.usesLeft, 0)))
        .returning();
      if (used.length === 0) throw new RedeemError("This code is invalid or already used");
      const [p] = await tx
        .update(products)
        .set({ stock: sql`${products.stock} - 1`, updatedAt: new Date() })
        .where(and(eq(products.id, used[0].productId), gte(products.stock, 1), eq(products.type, "cape")))
        .returning();
      if (!p) throw new RedeemError("This cape is out of stock right now");
      const [o] = await tx
        .insert(orders)
        .values({
          paymentId: newPaymentId(),
          userId: user.userId,
          email: user.email,
          items: [{ productId: p.id, name: p.name, type: p.type, qty: 1, priceCents: 0 }],
          totalCents: 0,
          status: "redeemed",
        })
        .returning();
      return { ...o, productName: p.name };
    });
    const message = buildTelegramMessage({ ...order, kind: "redeem" }) + `\nCode: ${code}`;
    await notifyBot(message);
    return json({ paymentId: order.paymentId, product: order.productName, telegramUrl: telegramLink(message) });
  } catch (e) {
    if (e instanceof RedeemError) return json({ error: e.message }, 400);
    console.error(e);
    return json({ error: "Could not redeem code" }, 500);
  }
}
