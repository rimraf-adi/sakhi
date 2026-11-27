import type { Metadata } from "next";
import {
  Fraunces,
  Noto_Sans_Devanagari,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sakhi — Voice-First Maternal Health Agent for India",
  description:
    "The woman talks. The agent does the work. Registered by her hospital, Sakhi listens in her own language and acts on Ministry of Health danger-sign rules in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} ${devanagari.variable}`}
    >
      <body className="bg-[#F7F4ED] font-sans text-[#0F181A] antialiased selection:bg-[#D97745]/20 selection:text-[#0F181A]">
        {children}
      </body>
    </html>
  );
}
