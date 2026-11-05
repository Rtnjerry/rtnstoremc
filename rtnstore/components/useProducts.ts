"use client";

import { useCallback, useEffect, useState } from "react";

export type ProductDTO = {
  id: number;
  slug: string;
  type: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  image: string;
  badge: string;
  active: boolean;
  updatedAt: string;
};

/** Fetches products and keeps polling so stock stays live. */
export function useProducts(opts: { all?: boolean; interval?: number } = {}) {
  const { all = false, interval = 6000 } = opts;
  const [products, setProducts] = useState<ProductDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/products${all ? "?all=1" : ""}`, { cache: "no-store" });
      if (!r.ok) throw new Error("Failed to load");
      setProducts(await r.json());
      setError(null);
    } catch {
      setError("Couldn't load products");
    }
  }, [all]);

  useEffect(() => {
    refresh();
    const t = setInterval(() => document.visibilityState === "visible" && refresh(), interval);
    return () => clearInterval(t);
  }, [refresh, interval]);

  return { products, error, refresh };
}
