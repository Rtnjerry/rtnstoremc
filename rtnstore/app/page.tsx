import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, Send } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";

export default function Home() {
  return (
    <>
      <section className="hero">
        <Image src="/img/hero.webp" alt="Blocky voxel landscape at golden hour" fill priority sizes="100vw" className="hero-img" />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="eyebrow">Welcome to RTNStore</span>
          <h1>
            Your next adventure,
            <br />
            one block away.
          </h1>
          <p>Premium Minecraft accounts and exclusive capes. Instant checkout, live stock, real humans on Telegram.</p>
          <div className="hero-cta">
            <Link href="/accounts" className="btn btn-primary btn-lg">
              Shop accounts <ArrowRight size={18} />
            </Link>
            <Link href="/capes" className="btn btn-glass btn-lg">
              Browse capes
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        {[
          { icon: Zap, t: "Instant delivery", d: "Orders are confirmed through Telegram within minutes.", c: "#ff9500" },
          { icon: ShieldCheck, t: "Full access", d: "Every account is checked and ships with full access.", c: "#34c759" },
          { icon: Send, t: "Telegram checkout", d: "Your payment ID is sent straight to @rtnstores.", c: "#229ed9" },
        ].map(({ icon: Icon, t, d, c }) => (
          <div className="card feature" key={t}>
            <span className="row-icon big" style={{ background: c }}>
              <Icon size={22} />
            </span>
            <h3>{t}</h3>
            <p className="muted">{d}</p>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Accounts</h2>
            <p className="muted">From $9.99 to $49.99</p>
          </div>
          <Link href="/accounts" className="link">
            See all <ArrowRight size={16} />
          </Link>
        </div>
        <ProductGrid type="account" limit={3} />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Capes</h2>
            <p className="muted">From $0.99 to $9.99 · all redeemable by code</p>
          </div>
          <Link href="/capes" className="link">
            See all <ArrowRight size={16} />
          </Link>
        </div>
        <ProductGrid type="cape" limit={3} />
      </section>
    </>
  );
}
