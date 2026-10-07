import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Être rappelé gratuitement : défiscalisation et énergies renouvelables",
  description: "Simulez votre situation en 1 minute et recevez une étude gratuite, sans engagement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
