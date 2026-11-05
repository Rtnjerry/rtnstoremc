import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";

export const metadata: Metadata = { title: "Accounts" };

export default function AccountsPage() {
  return (
    <div className="container">
      <header className="large-title">
        <span className="eyebrow">Minecraft Accounts</span>
        <h1>Accounts</h1>
        <p className="muted">Full-access accounts from $9.99 to $49.99. Stock updates live.</p>
      </header>
      <ProductGrid type="account" />
    </div>
  );
}
