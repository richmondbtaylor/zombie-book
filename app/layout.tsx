import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Sponsors from "@/components/Sponsors";

export const metadata: Metadata = {
  title: "Zombie Book",
  description: "A half-built scheduling app. Bring it back to life.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="zombie-bar">
          🧟 Zombie build: it half works. Read ZOMBIE.md for what to fix.
        </div>
        <nav className="nav">
          <Link href="/" className="brand">Zombie Book</Link>
          <Link href="/host">Host dashboard</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <main>{children}</main>
        <Sponsors />
      </body>
    </html>
  );
}
