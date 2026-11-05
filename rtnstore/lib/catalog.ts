import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";

export const PRICE_RANGES = {
  account: { min: 999, max: 4999 },
  cape: { min: 99, max: 999 },
} as const;

export type ProductType = keyof typeof PRICE_RANGES;

const SEED = [
  { slug: "java-bedrock", type: "account", name: "Java+Bedrock Starter", description: "Full-access Java&Bedrock Edition account. Change email, skin and username.", priceCents: 999, stock: 2500, image: "/img/account-java.webp", badge: "Popular" },
  { slug: "java-bedrock-random", type: "account", name: "Java + Bedrock Random Cape", description: "Both editions on one Microsoft account. Play on PC, console and mobile. Random cape included.", priceCents: 1399, stock: 150, image: "/img/account-bedrock.webp", badge: "Best value" },
  { slug: "og-premium", type: "account", name: "Custom Cape Premium Account", description: "Rare OG-name account with migration done and multiple capes unlocked.", priceCents: 4999, stock: 5, image: "/img/account-premium.webp", badge: "Rare" },
  { slug: "copper-cape", type: "cape", name: "COPPER CAPE", description: "Copper pattern. Delivered as a redeem code.", priceCents: 99, stock: 50, image: "/img/copper-cape.webp", badge: "" },
  { slug: "home-cape", type: "cape", name: "HOME CAPE", description: "Home Cape weave. Delivered as a redeem code.", priceCents: 199, stock: 20, image: "/img/home-cape.webp", badge: "New" },
  { slug: "menace-cape", type: "cape", name: "MENACE CAPE", description: "Menace Cape with nether portal look like. Delivered as a redeem code.", priceCents: 199, stock: 10, image: "/img/menace-cape.webp", badge: "" },
  { slug: "builder-cape", type: "cape", name: "BUILDER CAPE", description: "Builder Cape with custom design. Delivered as a redeem code.", priceCents: 199, stock: 10, image: "/img/builder-cape.webp", badge: "New" },
  { slug: "aurora-cape", type: "cape", name: "AURORA CAPE", description: "Aurora borealis pattern. Delivered as a redeem code.", priceCents: 99, stock: 10, image: "/img/aurora-cape.webp", badge: "New" },
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
