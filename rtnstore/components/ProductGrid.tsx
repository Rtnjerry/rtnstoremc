"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useStore } from "./Providers";
import { useProducts, type ProductDTO } from "./useProducts";
import { money } from "@/lib/format";

export function StockPill({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="stock out">Sold out</span>;
  if (stock <= 5) return <span className="stock low">Only {stock} left</span>;
  return <span className="stock ok">{stock} in stock</span>;
}

export function ProductCard({ p }: { p: ProductDTO }) {
  const { add, cart } = useStore();
  const inCart = cart.find((l) => l.id === p.id)?.qty ?? 0;
  return (
    <article className="card product">
      <div className="product-media">
        <Image src={p.image} alt={p.name} fill sizes="(max-width: 700px) 100vw, 33vw" />
        {p.badge && <span className="badge">{p.badge}</span>}
        <span className="type-chip">{p.type === "cape" ? "Cape · Redeem code" : "Account"}</span>
      </div>
      <div className="product-body">
        <div className="product-top">
          <h3>{p.name}</h3>
          <span className="price">{money(p.priceCents)}</span>
        </div>
        <p className="muted">{p.description}</p>
        <div className="product-foot">
          <StockPill stock={p.stock} />
          <button className="btn btn-primary btn-sm" disabled={p.stock <= 0} onClick={() => add({ id: p.id, name: p.name, type: p.type, priceCents: p.priceCents, image: p.image }, p.stock)}>
            <Plus size={16} /> {inCart ? `In cart (${inCart})` : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductGrid({ type, limit }: { type?: "account" | "cape"; limit?: number }) {
  const { products, error } = useProducts();
  if (error && !products) return <div className="card empty">{error}</div>;
  if (!products)
    return (
      <div className="grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card skeleton" />
        ))}
      </div>
    );
  let list = type ? products.filter((p) => p.type === type) : products;
  if (limit) list = list.slice(0, limit);
  if (list.length === 0) return <div className="card empty">Nothing here yet — check back soon.</div>;
  return (
    <div className="grid">
      {list.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
