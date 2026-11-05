"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { play, setSoundEnabled, type Sfx } from "@/lib/sfx";

export type CartLine = { id: number; name: string; type: string; priceCents: number; image: string; qty: number };
type Theme = "system" | "light" | "dark";
type ToastT = { id: number; text: string; tone: "ok" | "err" };

type Store = {
  cart: CartLine[];
  count: number;
  totalCents: number;
  add: (p: Omit<CartLine, "qty">, max: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  sound: boolean;
  setSound: (v: boolean) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  sfx: (s: Sfx) => void;
  toast: (text: string, tone?: "ok" | "err") => void;
};

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside Providers");
  return c;
};

export default function Providers({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [sound, setSoundState] = useState(true);
  const [theme, setThemeState] = useState<Theme>("system");
  const [settingsOpen, setSettingsOpenState] = useState(false);
  const [toasts, setToasts] = useState<ToastT[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("rtn-cart") || "[]"));
      const s = localStorage.getItem("rtn-sound");
      if (s !== null) setSoundState(s === "1");
      setThemeState((localStorage.getItem("rtn-theme") as Theme) || "system");
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("rtn-cart", JSON.stringify(cart));
  }, [cart, loaded]);

  useEffect(() => {
    setSoundEnabled(sound);
    if (loaded) localStorage.setItem("rtn-sound", sound ? "1" : "0");
  }, [sound, loaded]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
      root.dataset.theme = dark ? "dark" : "light";
    };
    apply();
    if (loaded) localStorage.setItem("rtn-theme", theme);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, loaded]);

  // Smooth scroll
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  // Tap sound for every button / link press
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest("a,button,[role=button],summary,label");
      if (el && !el.hasAttribute("data-nosfx")) play("tap");
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  const toast = useCallback((text: string, tone: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const value = useMemo<Store>(() => {
    const count = cart.reduce((s, l) => s + l.qty, 0);
    const totalCents = cart.reduce((s, l) => s + l.qty * l.priceCents, 0);
    return {
      cart,
      count,
      totalCents,
      add: (p, max) => {
        const existing = cart.find((l) => l.id === p.id);
        if ((existing?.qty ?? 0) >= max) {
          play("error");
          toast(max === 0 ? "Out of stock" : `Only ${max} in stock`, "err");
          return;
        }
        setCart((c) => (existing ? c.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l)) : [...c, { ...p, qty: 1 }]));
        play("pop");
        toast(`${p.name} added to cart`);
      },
      setQty: (id, qty) => setCart((c) => c.map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l))),
      remove: (id) => setCart((c) => c.filter((l) => l.id !== id)),
      clear: () => setCart([]),
      sound,
      setSound: (v) => {
        setSoundState(v);
        setSoundEnabled(v);
        if (v) play("toggle");
      },
      theme,
      setTheme: (t) => setThemeState(t),
      settingsOpen,
      setSettingsOpen: (v) => {
        if (v) play("open");
        setSettingsOpenState(v);
      },
      sfx: play,
      toast,
    };
  }, [cart, sound, theme, settingsOpen, toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
