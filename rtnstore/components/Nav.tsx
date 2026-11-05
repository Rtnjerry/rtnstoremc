"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Home, User, Sparkles, ShoppingBag, Settings } from "lucide-react";
import { useStore } from "./Providers";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/accounts", label: "Accounts", icon: User },
  { href: "/capes", label: "Capes", icon: Sparkles },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
];

export default function Nav() {
  const path = usePathname();
  const { count, setSettingsOpen } = useStore();
  const isActive = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <Image src="/img/logo-512.png" alt="RTNStore logo" width={34} height={34} className="brand-logo" priority />
            <span>RTNStore</span>
          </Link>
          <nav className="seg">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={isActive(l.href) ? "seg-item active" : "seg-item"}>
                {l.label}
                {l.href === "/cart" && count > 0 && <span className="pill-badge">{count}</span>}
              </Link>
            ))}
          </nav>
          <div className="top-actions">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="btn btn-tinted btn-sm">Sign in</button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
            <button className="icon-btn" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <nav className="tabbar">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={isActive(href) ? "tab active" : "tab"}>
            <span className="tab-icon">
              <Icon size={22} />
              {href === "/cart" && count > 0 && <span className="tab-badge">{count}</span>}
            </span>
            <span>{label}</span>
          </Link>
        ))}
        <button className="tab" onClick={() => setSettingsOpen(true)}>
          <span className="tab-icon">
            <Settings size={22} />
          </span>
          <span>Settings</span>
        </button>
      </nav>
    </>
  );
}
