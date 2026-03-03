import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { VerificationProvider } from "@/lib/verification-context";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Veritext - Document Verification & Intelligence Platform",
  description:
    "AI-powered document verification, extraction, comparison, and compliance checking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <VerificationProvider>{children}</VerificationProvider>
        <Analytics />
      </body>
    </html>
  );
}
