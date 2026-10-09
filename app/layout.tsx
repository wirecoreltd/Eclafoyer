import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Pompe à chaleur à 1 € symbolique : êtes-vous éligible ? | EclaFoyer",
  description: "Répondez à quelques questions en 2 minutes et découvrez si vous êtes éligible à la pompe à chaleur à 1 € symbolique. Sondage gratuit et sans engagement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
