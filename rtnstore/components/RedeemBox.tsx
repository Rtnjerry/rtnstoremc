"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Gift } from "lucide-react";
import { useStore } from "./Providers";

export default function RedeemBox() {
  const { isSignedIn } = useAuth();
  const { sfx, toast } = useStore();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ paymentId: string; product: string; telegramUrl: string } | null>(null);

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(d);
      setCode("");
      sfx("success");
      toast(`${d.product} redeemed!`);
    } catch (err) {
      sfx("error");
      toast((err as Error).message || "Redeem failed", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card redeem">
      <div className="redeem-head">
        <span className="row-icon big" style={{ background: "linear-gradient(135deg,#ff2d55,#af52de)" }}>
          <Gift size={22} />
        </span>
        <div>
          <h3>Redeem a cape code</h3>
          <p className="muted">Every cape can be claimed with a code. Enter yours to unlock it instantly.</p>
        </div>
      </div>
      {done ? (
        <div className="redeem-done">
          <p>
            <strong>{done.product}</strong> is yours. Payment ID <code>{done.paymentId}</code>
          </p>
          <a className="btn btn-primary" href={done.telegramUrl} target="_blank" rel="noreferrer">
            Send to @rtnstores on Telegram
          </a>
          <button className="btn btn-plain" onClick={() => setDone(null)}>
            Redeem another
          </button>
        </div>
      ) : isSignedIn ? (
        <form onSubmit={redeem} className="redeem-form">
          <input className="field" placeholder="RTN-XXXXXXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
          <button className="btn btn-primary" disabled={busy || !code}>
            {busy ? "Redeeming…" : "Redeem"}
          </button>
        </form>
      ) : (
        <SignInButton mode="modal">
          <button className="btn btn-tinted">Sign in to redeem</button>
        </SignInButton>
      )}
    </section>
  );
}
