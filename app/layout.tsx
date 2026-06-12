import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LanguageToggle from "@/components/LanguageToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bank Recon App",
  description: "Bank reconciliation application",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bank Recon App",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FDFCFB" />
      </head>
      <body className={inter.className}>
        <header style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end' }}>
          <LanguageToggle />
        </header>
        {children}
      </body>
    </html>
  );
}
