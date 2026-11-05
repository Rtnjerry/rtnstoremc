import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import RedeemBox from "@/components/RedeemBox";

export const metadata: Metadata = { title: "Capes" };

export default function CapesPage() {
  return (
    <div className="container">
      <header className="large-title">
        <span className="eyebrow">Cosmetics</span>
        <h1>Capes</h1>
        <p className="muted">Capes from $0.99 to $9.99. Every cape is delivered and redeemable by code.</p>
      </header>
      <RedeemBox />
      <ProductGrid type="cape" />
    </div>
  );
}
