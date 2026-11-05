import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";

export const PRICE_RANGES = {
  account: { min: 999, max: 4999 },
  cape: { min: 99, max: 999 },
} as const;

export type ProductType = keyof typeof PRICE_RANGES;

const SEED = [
  { slug: "java-starter", type: "account", name: "Java & Bedrock Starter", description: "Full-access Java&Bedrock Edition account. Change email, skin and username.", priceCents: 999, stock: 25, image: "/img/account-java.webp", badge: "Popular" },
  { slug: "java-bedrock-bundle", type: "account", name: "Java + Bedrock Random", description: "Both editions on one Microsoft account. Play on PC, console and mobile. Random Cape", priceCents: 1999, stock: 15, image: "/img/account-bedrock.webp", badge: "Best value" },
  { slug: "og-premium", type: "account", name: "OG Premium", description: "Rare OG-name account with migration done and multiple capes unlocked.", priceCents: 4999, stock: 5, image: "/img/account-premium.webp", badge: "Rare" },
  { slug: "ember-cape", type: "cape", name: "Copper Cape", description: "Copper Cape pattern. Delivered as a redeem code.", priceCents: 99, stock: 100, image: "/img/cape-ember.webp", badge: "" },
  { slug: "frost-cape", type: "cape", name: "Home Cape", description: "Home Cape pattern. Delivered as a redeem code.", priceCents: 299, stock: 60, image: "/img/cape-frost.webp", badge: "New" },
  { slug: "ender-cape", type: "cape", name: "Menace Cape", description: "Menace Cape pattern. Delivered as a redeem code.", priceCents: 599, stock: 30, image: "/img/cape-ender.webp", badge: "" },
  { slug: "golden-cape", type: "cape", name: "Aurora Cape", description: "Aurora Cape pattern. Delivered as a redeem code.", priceCents: 999, stock: 10, image: "/img/cape-gold.webp", badge: "Limited" },
] as const;

let seeded = false;
export async function ensureSeeded() {
  if (seeded) return;
  const db = getDb();
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
  if (count === 0) {
    await db.insert(products).values(SEED.map((p) => ({ ...p }))).onConflictDoNothing();
  }
  seeded = true;
}

export function validPrice(type: string, priceCents: number) {
  const r = PRICE_RANGES[type as ProductType];
  return !!r && Number.isInteger(priceCents) && priceCents >= r.min && priceCents <= r.max;
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) + "-" + Math.random().toString(36).slice(2, 6);
}

export function newPaymentId() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RTN-${t}-${r}`;
}
