"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Boxes, PlusCircle, Ticket, Receipt, Minus, Plus, Pencil, Trash2, ChevronLeft, Copy } from "lucide-react";
import { useStore } from "./Providers";
import { useIsAdmin } from "./useIsAdmin";
import { useProducts, type ProductDTO } from "./useProducts";
import { ProductCard } from "./ProductGrid";
import { money } from "@/lib/format";

type Tab = "inventory" | "add" | "codes" | "orders";
const IMAGES = ["/img/account-java.webp", "/img/account-bedrock.webp", "/img/account-premium.webp", "/img/cape-ember.webp", "/img/cape-frost.webp", "/img/cape-ender.webp", "/img/cape-gold.webp", "/img/hero.webp"];

async function api(url: string, method: string, body?: unknown) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Request failed");
  return d;
}

export default function AdminPanel() {
  const { isLoaded, isSignedIn } = useAuth();
  const isAdmin = useIsAdmin();
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (!isLoaded) return;
    const t = setTimeout(() => setChecked(true), isSignedIn ? 1200 : 0);
    return () => clearTimeout(t);
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) return <div className="container"><div className="card skeleton" /></div>;
  if (!isSignedIn)
    return (
      <div className="container narrow">
        <div className="card empty big-empty">
          <h3>Admins only</h3>
          <p className="muted">Sign in with an admin account to manage the store.</p>
          <SignInButton mode="modal">
            <button className="btn btn-primary">Sign in</button>
          </SignInButton>
        </div>
      </div>
    );
  if (!isAdmin)
    return (
      <div className="container narrow">
        <div className="card empty big-empty">
          {checked ? (
            <>
              <h3>No access</h3>
              <p className="muted">Your account isn't on the admin list.</p>
              <Link className="btn btn-tinted" href="/">Back to store</Link>
            </>
          ) : (
            <p className="muted">Checking access…</p>
          )}
        </div>
      </div>
    );
  return <Dashboard />;
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>("inventory");
  const { products, refresh } = useProducts({ all: true, interval: 3000 });
  const [editing, setEditing] = useState<ProductDTO | null>(null);
  const [mobileMain, setMobileMain] = useState(false);

  const nav: { id: Tab; label: string; icon: typeof Boxes; color: string }[] = [
    { id: "inventory", label: "Inventory", icon: Boxes, color: "#007aff" },
    { id: "add", label: "Add Item", icon: PlusCircle, color: "#34c759" },
    { id: "codes", label: "Redeem Codes", icon: Ticket, color: "#ff2d55" },
    { id: "orders", label: "Orders", icon: Receipt, color: "#ff9500" },
  ];
  const totals = {
    stock: products?.reduce((s, p) => s + p.stock, 0) ?? 0,
    low: products?.filter((p) => p.stock <= 5).length ?? 0,
  };

  return (
    <div className="admin">
      <aside className={`admin-side ${mobileMain ? "hide-mobile" : ""}`}>
        <div className="large-title compact">
          <span className="eyebrow live-dot">Live</span>
          <h1>Admin</h1>
        </div>
        <div className="stat-row">
          <div className="stat"><b>{products?.length ?? "–"}</b><span>Items</span></div>
          <div className="stat"><b>{totals.stock}</b><span>In stock</span></div>
          <div className="stat"><b className={totals.low ? "warn" : ""}>{totals.low}</b><span>Low</span></div>
        </div>
        <div className="group">
          {nav.map(({ id, label, icon: Icon, color }) => (
            <button key={id} className={`row ${tab === id ? "selected" : ""}`} onClick={() => { setTab(id); setEditing(null); setMobileMain(true); }}>
              <span className="row-icon" style={{ background: color }}><Icon size={16} /></span>
              <span className="row-title">{label}</span>
            </button>
          ))}
        </div>
      </aside>
      <section className={`admin-main ${mobileMain ? "" : "hide-mobile"}`}>
        <button className="back-btn show-mobile" onClick={() => setMobileMain(false)}>
          <ChevronLeft size={20} /> Admin
        </button>
        {editing ? (
          <Editor key={editing.id} initial={editing} onDone={() => { setEditing(null); refresh(); }} />
        ) : tab === "inventory" ? (
          <Inventory products={products} refresh={refresh} onEdit={setEditing} />
        ) : tab === "add" ? (
          <Editor onDone={() => { setTab("inventory"); refresh(); }} />
        ) : tab === "codes" ? (
          <Codes products={products} />
        ) : (
          <Orders />
        )}
      </section>
    </div>
  );
}

function Inventory({ products, refresh, onEdit }: { products: ProductDTO[] | null; refresh: () => void; onEdit: (p: ProductDTO) => void }) {
  const { toast, sfx } = useStore();
  const [filter, setFilter] = useState<"all" | "account" | "cape">("all");
  const patch = async (p: ProductDTO, body: Record<string, unknown>) => {
    try {
      await api(`/api/products/${p.id}`, "PATCH", body);
      refresh();
    } catch (e) {
      sfx("error");
      toast((e as Error).message, "err");
    }
  };
  const list = (products ?? []).filter((p) => filter === "all" || p.type === filter);
  return (
    <>
      <div className="main-head">
        <h2>Inventory</h2>
        <div className="mini-seg wide">
          {(["all", "account", "cape"] as const).map((f) => (
            <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "account" ? "Accounts" : "Capes"}
            </button>
          ))}
        </div>
      </div>
      <div className="group">
        {list.map((p) => (
          <div className={`row inv-row ${p.active ? "" : "inactive"}`} key={p.id}>
            <div className="thumb"><Image src={p.image} alt="" fill sizes="56px" /></div>
            <div className="cart-info">
              <div className="row-title">{p.name}</div>
              <div className="row-sub">{money(p.priceCents)} · {p.type}{p.active ? "" : " · hidden"}</div>
            </div>
            <div className="stepper">
              <button aria-label="Stock down" onClick={() => patch(p, { stockDelta: -1 })}><Minus size={14} /></button>
              <input
                key={`${p.id}-${p.stock}`}
                className="stock-input"
                defaultValue={p.stock}
                inputMode="numeric"
                onBlur={(e) => Number(e.target.value) !== p.stock && patch(p, { stock: Number(e.target.value) })}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              />
              <button aria-label="Stock up" onClick={() => patch(p, { stockDelta: 1 })}><Plus size={14} /></button>
            </div>
            <input type="checkbox" className="switch" title="Visible in store" checked={p.active} onChange={(e) => patch(p, { active: e.target.checked })} />
            <button className="icon-btn" aria-label="Edit" onClick={() => onEdit(p)}><Pencil size={16} /></button>
          </div>
        ))}
        {products && list.length === 0 && <div className="row muted">No items</div>}
        {!products && <div className="row muted">Loading…</div>}
      </div>
      <p className="muted small">Stock updates instantly for shoppers and drops automatically when orders are placed.</p>
    </>
  );
}

function Editor({ initial, onDone }: { initial?: ProductDTO; onDone: () => void }) {
  const { toast, sfx } = useStore();
  const [f, setF] = useState({
    type: initial?.type ?? "account",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial ? (initial.priceCents / 100).toFixed(2) : "9.99",
    stock: String(initial?.stock ?? 10),
    image: initial?.image ?? IMAGES[0],
    badge: initial?.badge ?? "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const range = f.type === "cape" ? [0.99, 9.99] : [9.99, 49.99];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...f, price: Number(f.price), stock: Number(f.stock) };
      if (initial) await api(`/api/products/${initial.id}`, "PATCH", body);
      else await api("/api/products", "POST", body);
      sfx("success");
      toast(initial ? "Item updated" : "Item added");
      onDone();
    } catch (err) {
      sfx("error");
      toast((err as Error).message, "err");
    } finally {
      setBusy(false);
    }
  };
  const del = async () => {
    if (!initial || !confirm(`Delete ${initial.name}?`)) return;
    await api(`/api/products/${initial.id}`, "DELETE");
    toast("Item deleted");
    onDone();
  };

  const preview: ProductDTO = {
    id: initial?.id ?? -1, slug: "", type: f.type, name: f.name || "New item", description: f.description,
    priceCents: Math.round(Number(f.price) * 100) || 0, stock: Number(f.stock) || 0, image: f.image, badge: f.badge, active: true, updatedAt: "",
  };

  return (
    <>
      <div className="main-head">
        <h2>{initial ? "Edit item" : "Add item"}</h2>
        {initial && <button className="btn btn-plain danger" onClick={onDone}>Cancel</button>}
      </div>
      <div className="editor">
        <form onSubmit={save} className="editor-form">
          <div className="group form-group">
            {!initial && (
              <label className="row">
                <span className="row-title">Type</span>
                <select className="field-inline" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value, price: e.target.value === "cape" ? "0.99" : "9.99", image: e.target.value === "cape" ? IMAGES[3] : IMAGES[0] })}>
                  <option value="account">Account</option>
                  <option value="cape">Cape</option>
                </select>
              </label>
            )}
            <label className="row"><span className="row-title">Name</span><input className="field-inline" value={f.name} onChange={set("name")} required placeholder="Item name" /></label>
            <label className="row"><span className="row-title">Price ($)</span><input className="field-inline" type="number" step="0.01" min={range[0]} max={range[1]} value={f.price} onChange={set("price")} required /></label>
            <label className="row"><span className="row-title">Stock</span><input className="field-inline" type="number" min={0} value={f.stock} onChange={set("stock")} required /></label>
            <label className="row"><span className="row-title">Badge</span><input className="field-inline" value={f.badge} onChange={set("badge")} placeholder="e.g. New" /></label>
          </div>
          <p className="muted small">{f.type === "cape" ? "Capes" : "Accounts"} must be priced ${range[0]}–${range[1]}.</p>
          <div className="group form-group">
            <textarea className="field area" rows={3} value={f.description} onChange={set("description")} placeholder="Description" />
          </div>
          <p className="group-label">Image</p>
          <div className="image-pick">
            {IMAGES.map((src) => (
              <button type="button" key={src} className={f.image === src ? "on" : ""} onClick={() => setF({ ...f, image: src })}>
                <Image src={src} alt="" fill sizes="80px" />
              </button>
            ))}
          </div>
          <input className="field" value={f.image} onChange={set("image")} placeholder="/img/your-image.webp" />
          <div className="editor-actions">
            <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? "Saving…" : initial ? "Save changes" : "Add to store"}</button>
            {initial && <button type="button" className="btn btn-plain danger" onClick={del}><Trash2 size={16} /> Delete</button>}
          </div>
        </form>
        <div className="editor-preview">
          <p className="group-label live-dot">Live preview</p>
          <ProductCard p={preview} />
        </div>
      </div>
    </>
  );
}

type Code = { id: number; code: string; usesLeft: number; productId: number; productName: string };

function Codes({ products }: { products: ProductDTO[] | null }) {
  const { toast, sfx } = useStore();
  const capes = (products ?? []).filter((p) => p.type === "cape");
  const [codes, setCodes] = useState<Code[]>([]);
  const [form, setForm] = useState({ productId: "", code: "", uses: "1" });
  const load = useCallback(() => api("/api/admin/codes", "GET").then(setCodes).catch(() => {}), []);
  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/admin/codes", "POST", { productId: Number(form.productId || capes[0]?.id), code: form.code, uses: Number(form.uses) });
      sfx("success");
      toast("Code created");
      setForm({ ...form, code: "" });
      load();
    } catch (err) {
      sfx("error");
      toast((err as Error).message, "err");
    }
  };

  return (
    <>
      <div className="main-head"><h2>Redeem codes</h2></div>
      <form onSubmit={create} className="group form-group">
        <label className="row">
          <span className="row-title">Cape</span>
          <select className="field-inline" value={form.productId || capes[0]?.id || ""} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
            {capes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="row"><span className="row-title">Code</span><input className="field-inline" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Auto-generate" /></label>
        <label className="row"><span className="row-title">Uses</span><input className="field-inline" type="number" min={1} value={form.uses} onChange={(e) => setForm({ ...form, uses: e.target.value })} /></label>
        <div className="row"><button className="btn btn-primary btn-sm" disabled={!capes.length}>Create code</button></div>
      </form>
      <div className="group">
        {codes.map((c) => (
          <div className="row" key={c.id}>
            <div className="cart-info">
              <div className="row-title mono">{c.code}</div>
              <div className="row-sub">{c.productName} · {c.usesLeft} use{c.usesLeft === 1 ? "" : "s"} left</div>
            </div>
            <button className="icon-btn" aria-label="Copy" onClick={() => { navigator.clipboard.writeText(c.code); toast("Copied"); }}><Copy size={16} /></button>
            <button className="icon-btn" aria-label="Delete" onClick={() => api(`/api/admin/codes?id=${c.id}`, "DELETE").then(load)}><Trash2 size={16} /></button>
          </div>
        ))}
        {codes.length === 0 && <div className="row muted">No codes yet</div>}
      </div>
    </>
  );
}

type OrderDTO = { id: number; paymentId: string; email: string; items: { name: string; qty: number; priceCents: number }[]; totalCents: number; status: string; createdAt: string };

function Orders() {
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const load = useCallback(() => api("/api/admin/orders", "GET").then(setOrders).catch(() => {}), []);
  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);
  return (
    <>
      <div className="main-head"><h2>Orders</h2><span className="muted small live-dot">Auto-refreshing</span></div>
      <div className="group">
        {orders?.map((o) => (
          <div className="row order-row" key={o.id}>
            <div className="cart-info">
              <div className="row-title mono">{o.paymentId}</div>
              <div className="row-sub">{o.email} · {new Date(o.createdAt).toLocaleString()}</div>
              <div className="row-sub">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</div>
            </div>
            <b>{money(o.totalCents)}</b>
            <select className={`status-select s-${o.status}`} value={o.status} onChange={(e) => api("/api/admin/orders", "PATCH", { id: o.id, status: e.target.value }).then(load)}>
              {["pending", "paid", "redeemed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
        {orders?.length === 0 && <div className="row muted">No orders yet</div>}
        {!orders && <div className="row muted">Loading…</div>}
      </div>
    </>
  );
}
