import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rightfit — Recruitment Portal",
  description: "Rightfit recruitment management portal for clients and the Rightfit team.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50">{children}</body>
    </html>
  );
}
