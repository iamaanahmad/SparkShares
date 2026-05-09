import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spark-shares.vercel.app"),
  title: "SparkShares — Tokenized Micro-Grant Marketplace for Creators",
  description:
    "Launch project tokens on Bags, auto-fund your community with micro-grants, and distribute rewards to builders. Powered by Solana and Bags fee-sharing.",
  keywords: [
    "SparkShares",
    "Bags Hackathon",
    "Solana",
    "micro-grants",
    "token launch",
    "fee-sharing",
    "creator funding",
    "decentralized bounties",
  ],
  authors: [{ name: "SparkShares Team" }],
  openGraph: {
    title: "SparkShares — Tokenized Micro-Grant Marketplace",
    description:
      "Launch project tokens on Bags, auto-fund your community with micro-grants, and distribute rewards directly to builders.",
    url: "https://spark-shares.vercel.app",
    siteName: "SparkShares",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 400,
        alt: "SparkShares Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SparkShares — Tokenized Micro-Grant Marketplace",
    description:
      "Launch project tokens on Bags, auto-fund your community, distribute micro-grants. Powered by Solana.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-50`}
      >
        <WalletProvider>
          {children}
          <Toaster theme="dark" />
        </WalletProvider>
      </body>
    </html>
  );
}
