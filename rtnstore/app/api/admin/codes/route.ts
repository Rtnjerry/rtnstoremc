import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products, redeemCodes } from "@/db/schema";
import { json, requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return json({ error: "Admins only" }, 403);
  const rows = await getDb()
    .select({ id: redeemCodes.id, code: redeemCodes.code, usesLeft: redeemCodes.usesLeft, productId: redeemCodes.productId, productName: products.name })
    .from(redeemCodes)
    .innerJoin(products, eq(products.id, redeemCodes.productId))
    .orderBy(desc(redeemCodes.id))
    .limit(100);
  return json(rows);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return json({ error: "Admins only" }, 403);
  const b = await req.json().catch(() => ({}));
  const productId = Number(b.productId);
  const uses = Math.max(1, Math.floor(Number(b.uses ?? 1)));
  const code = (String(b.code ?? "").trim() || "RTN-" + Math.random().toString(36).slice(2, 10)).toUpperCase();
  const [p] = await getDb().select().from(products).where(eq(products.id, productId));
  if (!p || p.type !== "cape") return json({ error: "Pick a cape" }, 400);
  try {
    const [row] = await getDb().insert(redeemCodes).values({ code, productId, usesLeft: uses }).returning();
    return json(row, 201);
  } catch {
    return json({ error: "That code already exists" }, 409);
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return json({ error: "Admins only" }, 403);
  const id = Number(new URL(req.url).searchParams.get("id"));
  await getDb().delete(redeemCodes).where(eq(redeemCodes.id, id));
  return json({ ok: true });
}
