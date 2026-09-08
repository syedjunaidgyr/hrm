import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendor Recruitment Management Portal",
  description: "Enterprise multi-tenant recruitment management portal for Admin teams and recruitment Vendors.",
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
