"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Minus, Plus, Trash2, Send, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useStore } from "@/components/Providers";
import { useProducts } from "@/components/useProducts";
import { money } from "@/lib/format";

export default function CartPage() {
  const { cart, setQty, remove, clear, totalCents, sfx, toast } = useStore();
  const { products } = useProducts({ interval: 5000 });
  const { isSignedIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ paymentId: string; totalCents: number; telegramUrl: string } | null>(null);

  const stockOf = (id: number) => products?.find((p) => p.id === id)?.stock;

  const checkout = async () => {
    setBusy(true);
    // Open the window synchronously so popup blockers allow it.
    const win = window.open("about:blank", "_blank");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.map((l) => ({ id: l.id, qty: l.qty })) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(d);
      clear();
      sfx("success");
      if (win) win.location.href = d.telegramUrl;
      else window.location.href = d.telegramUrl;
    } catch (e) {
      win?.close();
      sfx("error");
      toast((e as Error).message || "Checkout failed", "err");
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="container narrow">
        <div className="card success-card">
          <CheckCircle2 size={56} className="success-icon" />
          <h1>Order placed</h1>
          <p className="muted">Your payment request was sent to Telegram. Send the prefilled message to @rtnstores to complete payment.</p>
          <div className="group inset">
            <div className="row">
              <span className="row-title">Payment ID</span>
              <code className="row-value">{done.paymentId}</code>
            </div>
            <div className="row">
              <span className="row-title">Total</span>
              <span className="row-value">{money(done.totalCents)}</span>
            </div>
          </div>
          <a href={done.telegramUrl} target="_blank" rel="noreferrer" className="btn btn-telegram btn-lg">
            <Send size={18} /> Open Telegram again
          </a>
          <Link href="/" className="btn btn-plain">
            Continue shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div className="container narrow">
      <header className="large-title">
        <span className="eyebrow">Your bag</span>
        <h1>Cart</h1>
      </header>

      {cart.length === 0 ? (
        <div className="card empty big-empty">
          <ShoppingBag size={44} />
          <h3>Your cart is empty</h3>
          <p className="muted">Grab an account or a cape to get started.</p>
          <div className="hero-cta center">
            <Link href="/accounts" className="btn btn-primary">
              Accounts
            </Link>
            <Link href="/capes" className="btn btn-tinted">
              Capes
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="group cart-list">
            {cart.map((l) => {
              const stock = stockOf(l.id);
              const over = stock !== undefined && l.qty > stock;
              return (
                <div className="row cart-row" key={l.id}>
                  <div className="thumb">
                    <Image src={l.image} alt="" fill sizes="64px" />
                  </div>
                  <div className="cart-info">
                    <div className="row-title">{l.name}</div>
                    <div className={over ? "row-sub warn" : "row-sub"}>
                      {money(l.priceCents)} · {l.type === "cape" ? "Cape" : "Account"}
                      {stock !== undefined && ` · ${stock <= 0 ? "Sold out" : `${stock} left`}`}
                    </div>
                  </div>
                  <div className="stepper">
                    <button aria-label="Decrease" onClick={() => (l.qty <= 1 ? remove(l.id) : setQty(l.id, l.qty - 1))}>
                      {l.qty <= 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                    </button>
                    <span>{l.qty}</span>
                    <button aria-label="Increase" disabled={stock !== undefined && l.qty >= stock} onClick={() => setQty(l.id, l.qty + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="group summary">
            <div className="row">
              <span className="row-title">Subtotal</span>
              <span className="row-value">{money(totalCents)}</span>
            </div>
            <div className="row">
              <span className="row-title">Payment</span>
              <span className="row-value">via Telegram @rtnstores</span>
            </div>
            <div className="row total">
              <span className="row-title">Total</span>
              <span className="row-value">{money(totalCents)}</span>
            </div>
          </div>

          {isSignedIn ? (
            <button className="btn btn-telegram btn-lg btn-block" disabled={busy} onClick={checkout}>
              <Send size={18} /> {busy ? "Placing order…" : "Checkout with Telegram"}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="btn btn-primary btn-lg btn-block">Sign in to checkout</button>
            </SignInButton>
          )}
          <p className="muted small center">Checkout reserves your stock and opens Telegram with your payment ID prefilled.</p>
        </>
      )}
    </div>
  );
}
