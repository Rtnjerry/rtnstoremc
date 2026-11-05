import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded, slugify, validPrice } from "@/lib/catalog";
import { json, requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureSeeded();
  const all = new URL(req.url).searchParams.get("all") === "1";
  const rows = await getDb().select().from(products).orderBy(asc(products.type), asc(products.priceCents), desc(products.id));
  if (all && (await requireAdmin())) return json(rows);
  return json(rows.filter((p) => p.active));
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return json({ error: "Admins only" }, 403);
  const b = await req.json().catch(() => ({}));
  const type = String(b.type ?? "");
  const name = String(b.name ?? "").trim();
  const priceCents = Math.round(Number(b.price) * 100);
  const stock = Math.max(0, Math.floor(Number(b.stock ?? 0)));
  if (!name) return json({ error: "Name is required" }, 400);
  if (!validPrice(type, priceCents))
    return json({ error: type === "cape" ? "Cape price must be $0.99–$9.99" : "Account price must be $9.99–$49.99" }, 400);
  const [row] = await getDb()
    .insert(products)
    .values({
      slug: slugify(name),
      type,
      name,
      description: String(b.description ?? ""),
      priceCents,
      stock,
      image: String(b.image ?? "").startsWith("/") ? String(b.image) : type === "cape" ? "/img/cape-gold.webp" : "/img/account-java.webp",
      badge: String(b.badge ?? ""),
    })
    .returning();
  return json(row, 201);
}
