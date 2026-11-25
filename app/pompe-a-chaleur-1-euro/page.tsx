import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/LegalShell";
import { SITE, telHref } from "@/lib/site";

const TITLE = "Pompe à chaleur à 1 € : conditions d’éligibilité 2026 | EclaFoyer";
const DESC = "Pompe à chaleur à 1 € symbolique : qui y a droit, quelles aides cumuler (MaPrimeRénov’, CEE, TVA 5,5 %) et comment vérifier votre éligibilité gratuitement.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/pompe-a-chaleur-1-euro" },
  openGraph: { title: TITLE, description: DESC, type: "article", locale: "fr_FR", siteName: "EclaFoyer", url: "/pompe-a-chaleur-1-euro" },
};

const FAQ: [string, string][] = [
  ["Une pompe à chaleur à 1 € est-elle vraiment gratuite ?", "Pas systématiquement. Le « 1 € symbolique » désigne un reste à charge très faible, possible dans certains cas seulement (revenus modestes, installation éligible, aides cumulées). Le montant exact figure sur le devis, que vous recevez avant tout engagement."],
  ["Faut-il être propriétaire ?", "Oui. Les aides à la rénovation énergétique s’adressent aux propriétaires, qu’ils occupent le logement ou qu’ils le louent. Un locataire doit passer par son propriétaire."],
  ["Les revenus élevés donnent-ils droit à MaPrimeRénov’ pour une pompe à chaleur ?", "Non. Pour une pompe à chaleur seule, MaPrimeRénov’ est prévue pour les ménages aux revenus très modestes, modestes et intermédiaires. D’autres aides, comme la prime CEE ou la TVA à 5,5 %, peuvent rester accessibles."],
  ["L’installateur doit-il être certifié ?", "Oui. Pour que les aides s’appliquent, la pompe à chaleur doit être posée par un professionnel certifié RGE."],
  ["La pompe à chaleur air-air est-elle aidée ?", "Pas par MaPrimeRénov’ lorsqu’elle est installée seule : l’aide concerne les pompes à chaleur air-eau et géothermiques. D’autres aides, comme la TVA à 5,5 % sous conditions, peuvent s’appliquer."],
  ["Quand faut-il déposer le dossier d’aide ?", "Avant le début des travaux. Les montants dépendent de la date de dépôt : le barème actuel s’applique aux dossiers déposés depuis le 1er septembre 2026."],
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function Page() {
  return (
    <LegalShell titre="Pompe à chaleur à 1 € : conditions d’éligibilité" maj="25 novembre 2026">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <p>La « pompe à chaleur à 1 € » attire beaucoup de monde, mais l’expression prête à confusion. Voici ce qu’elle recouvre vraiment, qui peut y prétendre et comment le vérifier gratuitement.</p>

      <h2>Que signifie « pompe à chaleur à 1 € » ?</h2>
      <p>Il ne s’agit pas d’un prix affiché au catalogue. C’est un reste à charge très faible, obtenu lorsque les aides publiques cumulées couvrent l’essentiel du devis. Selon votre situation, le reste à charge peut être de quelques euros, de plusieurs milliers d’euros, ou la pompe à chaleur peut ne pas être éligible.</p>

      <h2>Les conditions pour être éligible</h2>
      <ul>
        <li><b>Être propriétaire</b> du logement (occupant ou bailleur). Pour MaPrimeRénov’, le logement doit en général être une résidence principale existante.</li>
        <li><b>Avoir des revenus sous les plafonds.</b> MaPrimeRénov’ distingue les ménages aux revenus très modestes, modestes et intermédiaires. Les plafonds dépendent de la composition du foyer et du lieu d’habitation.</li>
        <li><b>Choisir un équipement éligible :</b> pompe à chaleur air-eau ou géothermique. La pompe à chaleur air-air seule n’est pas financée par MaPrimeRénov’.</li>
        <li><b>Remplacer un ancien système de chauffage.</b> L’installateur vérifie avec vous si votre équipement actuel ouvre droit à l’aide.</li>
        <li><b>Faire appel à un installateur certifié RGE</b>, sans quoi les aides ne s’appliquent pas.</li>
        <li><b>Déposer le dossier avant le début des travaux.</b></li>
      </ul>

      <h2>Les aides qui peuvent se cumuler</h2>
      <p><b>MaPrimeRénov’</b> (dossiers déposés depuis le 1er septembre 2026) : pour une pompe à chaleur air-eau, 5 000 € pour les ménages très modestes, 4 000 € pour les modestes et 3 000 € pour les revenus intermédiaires. Pour une pompe à chaleur géothermique, 11 000 €, 9 000 € et 6 000 €. Aucun montant n’est prévu pour les revenus supérieurs. La dépense prise en compte est plafonnée (12 000 € TTC en air-eau, 18 000 € TTC en géothermique).</p>
      <p><b>La prime CEE</b> (certificats d’économies d’énergie), financée par les fournisseurs d’énergie, peut s’ajouter à MaPrimeRénov’. Son montant varie selon vos revenus, la zone climatique et la surface du logement.</p>
      <p><b>La TVA à 5,5 %</b> sur les travaux d’amélioration énergétique, appliquée directement sur la facture.</p>
      <p><b>L’éco-PTZ</b> peut financer le reste à charge à taux zéro.</p>

      <h2>Alors, une pompe à chaleur à 1 € est-elle possible ?</h2>
      <p>Dans certains cas, oui : pour des ménages aux revenus très modestes, le cumul de MaPrimeRénov’ et de la prime CEE peut couvrir une très grande partie du devis, voire la totalité. Pour des revenus intermédiaires ou supérieurs, le reste à charge est généralement plus élevé. Tout dépend de votre foyer, de votre logement et de l’équipement choisi : c’est pourquoi seul un devis chiffré peut vous donner le montant exact.</p>
      <p>Soyez prudent face aux offres qui promettent une pompe à chaleur « 100 % gratuite » sans étudier votre situation. Un professionnel sérieux établit un devis détaillé, vous laisse décider sans pression et ne vous demande aucun paiement avant d’avoir vérifié votre éligibilité.</p>

      <h2>Vérifiez votre éligibilité gratuitement</h2>
      <p>Répondez à quelques questions en 2 minutes : votre profil s’affiche tout de suite et un conseiller vous rappelle au créneau de votre choix. C’est gratuit et sans engagement.</p>
      <p><Link className="cta-btn" href="/#simulateur">Vérifier mon éligibilité</Link></p>
      {SITE.tel && <p>Vous préférez en parler ? Appelez-nous au <a href={telHref(SITE.tel)}>{SITE.tel}</a> ({SITE.horaires}).</p>}
      <p>Le service public vous informe aussi gratuitement avant tout engagement : <a href="https://france-renov.gouv.fr" target="_blank" rel="noopener noreferrer">france-renov.gouv.fr</a>.</p>

      <h2>Questions fréquentes</h2>
      {FAQ.map(([q, a]) => (
        <div key={q}>
          <p><b>{q}</b></p>
          <p>{a}</p>
        </div>
      ))}

      <p className="fine">Les montants indiqués sont ceux en vigueur à la date de mise à jour et peuvent évoluer. Offre soumise à conditions de ressources et à validation de votre dossier.</p>
    </LegalShell>
  );
}
