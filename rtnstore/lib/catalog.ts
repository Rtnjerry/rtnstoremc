import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";

export const PRICE_RANGES = {
  account: { min: 999, max: 4999 },
  cape: { min: 99, max: 999 },
} as const;

export type ProductType = keyof typeof PRICE_RANGES;

const SEED = [
  // Accounts
  { slug: "java-starter", type: "account", name: "Java Starter", description: "Full-access Java Edition account. Change email, skin and username.", priceCents: 999, stock: 25, image: "/img/account-java.webp", badge: "Popular" },
  { slug: "java-bedrock-bundle", type: "account", name: "Java + Bedrock Bundle", description: "Both editions on one Microsoft account. Play on PC, console and mobile.", priceCents: 1999, stock: 15, image: "/img/account-bedrock.webp", badge: "Best value" },
  { slug: "semi-og-clean", type: "account", name: "Semi-OG Clean Name", description: "Clean aesthetic 4-character unbanned username with instant email transfer.", priceCents: 2499, stock: 10, image: "/img/account-semiog.webp", badge: "Clean Name" },
  { slug: "hypixel-ranked", type: "account", name: "Hypixel MVP+ Account", description: "Level 50+ network rank, MVP+ unlocked, full access with clean ban history.", priceCents: 2999, stock: 12, image: "/img/account-hypixel.webp", badge: "Ranked" },
  { slug: "minecon-veteran", type: "account", name: "Minecon Veteran", description: "Legacy account registered 2012–2015 with classic history and full email change.", priceCents: 3999, stock: 6, image: "/img/account-veteran.webp", badge: "Legacy" },
  { slug: "og-premium", type: "account", name: "OG Premium", description: "Rare OG-name account with migration done and multiple capes unlocked.", priceCents: 4999, stock: 5, image: "/img/account-premium.webp", badge: "Rare" },

  // Capes
  { slug: "builder-cape", type: "cape", name: "Builder Cape", description: "Golden hazard grid and masonry tool emblem. Delivered as a redeem code.", priceCents: 99, stock: 100, image: "/img/cape-builder.webp", badge: "" },
  { slug: "aurora-cape", type: "cape", name: "Aurora Cape", description: "Vibrant polar aurora borealis gradient in emerald and cyan. Delivered as a redeem code.", priceCents: 99, stock: 100, image: "/img/cape-aurora.webp", badge: "Popular" },
  { slug: "copper-cape", type: "cape", name: "Copper Cape", description: "Oxidized metallic copper finish with verdigris patina. Delivered as a redeem code.", priceCents: 149, stock: 75, image: "/img/cape-copper.webp", badge: "New" },
  { slug: "home-cape", type: "cape", name: "Home Cape", description: "Cozy cottage hearth and compass weave. Delivered as a redeem code.", priceCents: 149, stock: 80, image: "/img/cape-home.webp", badge: "" },
  { slug: "menace-cape", type: "cape", name: "Menace Cape", description: "Dark crimson phantom wings with glowing demonic crest. Delivered as a redeem code.", priceCents: 199, stock: 50, image: "/img/cape-menace.webp", badge: "Exclusive" },
] as const;

let seeded = false;
export async function ensureSeeded() {
  if (seeded) return;
  const db = getDb();
  for (const p of SEED) {
    await db
      .insert(products)
      .values({ ...p })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: p.name,
          type: p.type,
          description: p.description,
          priceCents: p.priceCents,
          stock: p.stock,
          image: p.image,
          badge: p.badge,
        },
      });
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
