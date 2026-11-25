import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE, CONFIG } from "@/lib/site";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-sans" });

const title = "Pompe à chaleur à 1 € symbolique : vérifiez votre éligibilité | EclaFoyer";
const description = `Répondez à quelques questions en 2 minutes et découvrez si vous êtes éligible à la pompe à chaleur à 1 € symbolique. Vérification gratuite et sans engagement${SITE.installateurs ? `, avec ${SITE.installateurs} installateurs partenaires partout en France` : ""}.`;

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title, description,
  alternates: { canonical: "/" },
  keywords: ["pompe à chaleur 1 euro", "pompe à chaleur à 1 € symbolique", "éligibilité pompe à chaleur", "étude pompe à chaleur gratuite", "MaPrimeRénov pompe à chaleur", "prime CEE pompe à chaleur"],
  openGraph: { url: "/", title, description, type: "website", locale: "fr_FR", siteName: "EclaFoyer" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#0F6B6B" };

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.societe,
  url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  logo: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/logoEF.png` : undefined,
  telephone: CONFIG.tel ? "+33" + CONFIG.tel.replace(/\D/g, "").replace(/^0/, "") : undefined,
  email: CONFIG.email || undefined,
  areaServed: "FR",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={sans.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        {children}
      </body>
    </html>
  );
}
