import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";
import SettingsSheet from "@/components/SettingsSheet";
import "lenis/dist/lenis.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "RTNStore — Minecraft Accounts & Capes", template: "%s · RTNStore" },
  description: "Premium Minecraft accounts from $9.99 and capes from $0.99. Instant checkout via Telegram.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" appearance={{ variables: { colorPrimary: "#30b85b", borderRadius: "14px" } }}>
          <Providers>
            <Nav />
            <main className="page">{children}</main>
            <footer className="footer">
              <p>© {new Date().getFullYear()} RTNStore · Support on Telegram <a href="https://t.me/rtnstores">@rtnstores</a></p>
              <p className="muted">Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</p>
            </footer>
            <SettingsSheet />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
