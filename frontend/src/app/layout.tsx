import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DefiSense — Institutional Base DeFi Intelligence",
  description: "Autonomous DeFi Research, Risk Assessment & Yield Orchestration Agent on Base L2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8F9FA] text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
