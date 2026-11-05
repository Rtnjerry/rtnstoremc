import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial().primaryKey(),
  slug: text().notNull().unique(),
  type: text().notNull(), // "account" | "cape"
  name: text().notNull(),
  description: text().notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  stock: integer().notNull().default(0),
  image: text().notNull().default("/img/hero.webp"),
  badge: text().notNull().default(""),
  active: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type OrderItem = { productId: number; name: string; type: string; qty: number; priceCents: number };

export const orders = pgTable("orders", {
  id: serial().primaryKey(),
  paymentId: text("payment_id").notNull().unique(),
  userId: text("user_id").notNull(),
  email: text().notNull().default(""),
  items: jsonb().$type<OrderItem[]>().notNull(),
  totalCents: integer("total_cents").notNull(),
  status: text().notNull().default("pending"), // pending | paid | redeemed | cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const redeemCodes = pgTable("redeem_codes", {
  id: serial().primaryKey(),
  code: text().notNull().unique(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  usesLeft: integer("uses_left").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admins = pgTable("admins", {
  id: serial().primaryKey(),
  email: text().notNull().unique(),
  addedBy: text("added_by").notNull().default("system"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Admin = typeof admins.$inferSelect;
