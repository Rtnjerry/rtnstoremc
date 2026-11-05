"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Show, SignInButton, SignUpButton, SignOutButton, useUser } from "@clerk/nextjs";
import { ChevronRight, Moon, Volume2, ShieldCheck, Send, X, LogIn, UserPlus, LogOut, Sun, Monitor } from "lucide-react";
import { useStore } from "./Providers";
import { useIsAdmin } from "./useIsAdmin";

export default function SettingsSheet() {
  const { settingsOpen, setSettingsOpen, sound, setSound, theme, setTheme, sfx } = useStore();
  const { user } = useUser();
  const isAdmin = useIsAdmin();
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setSettingsOpen(false);
    }, 220);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && settingsOpen && close();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  if (!settingsOpen) return null;

  return (
    <div className={`sheet-backdrop ${closing ? "out" : ""}`} onClick={close} data-lenis-prevent>
      <div className={`sheet ${closing ? "out" : ""}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Settings">
        <div className="sheet-grabber" />
        <div className="sheet-head">
          <h2>Settings</h2>
          <button className="icon-btn" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <Show when="signed-in">
          <div className="group">
            <div className="row profile-row">
              <img src={user?.imageUrl} alt="" className="avatar" />
              <div>
                <div className="row-title">{user?.fullName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "RTN Player"}</div>
                <div className="row-sub">{user?.primaryEmailAddress?.emailAddress}</div>
              </div>
            </div>
          </div>
        </Show>

        <p className="group-label">Preferences</p>
        <div className="group">
          <label className="row">
            <span className="row-icon" style={{ background: "#ff9500" }}>
              <Volume2 size={16} />
            </span>
            <span className="row-title">Sound effects</span>
            <input type="checkbox" className="switch" checked={sound} onChange={(e) => setSound(e.target.checked)} />
          </label>
          <div className="row">
            <span className="row-icon" style={{ background: "#5856d6" }}>
              <Moon size={16} />
            </span>
            <span className="row-title">Appearance</span>
            <div className="mini-seg">
              {([
                ["light", Sun],
                ["dark", Moon],
                ["system", Monitor],
              ] as const).map(([t, Icon]) => (
                <button
                  key={t}
                  className={theme === t ? "on" : ""}
                  aria-label={t}
                  onClick={() => {
                    setTheme(t);
                    sfx("toggle");
                  }}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {isAdmin && (
          <>
            <p className="group-label">Management</p>
            <div className="group">
              <Link href="/admin" className="row" onClick={close}>
                <span className="row-icon" style={{ background: "#34c759" }}>
                  <ShieldCheck size={16} />
                </span>
                <span className="row-title">Admin Panel</span>
                <span className="row-sub live-dot">Live</span>
                <ChevronRight size={18} className="chev" />
              </Link>
            </div>
          </>
        )}

        <p className="group-label">Support</p>
        <div className="group">
          <a href="https://t.me/rtnstores" target="_blank" rel="noreferrer" className="row">
            <span className="row-icon" style={{ background: "#229ed9" }}>
              <Send size={16} />
            </span>
            <span className="row-title">Telegram @rtnstores</span>
            <ChevronRight size={18} className="chev" />
          </a>
        </div>

        <p className="group-label">Account</p>
        <div className="group">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="row" onClick={close}>
                <span className="row-icon" style={{ background: "#007aff" }}>
                  <LogIn size={16} />
                </span>
                <span className="row-title">Sign in</span>
                <ChevronRight size={18} className="chev" />
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="row" onClick={close}>
                <span className="row-icon" style={{ background: "#af52de" }}>
                  <UserPlus size={16} />
                </span>
                <span className="row-title">Create account</span>
                <ChevronRight size={18} className="chev" />
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <SignOutButton>
              <button className="row danger">
                <span className="row-icon" style={{ background: "#ff3b30" }}>
                  <LogOut size={16} />
                </span>
                <span className="row-title">Sign out</span>
              </button>
            </SignOutButton>
          </Show>
        </div>
        <p className="sheet-foot">RTNSTORE · Not affiliated with Mojang or Microsoft</p>
      </div>
    </div>
  );
}
