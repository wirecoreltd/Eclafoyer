import Funnel from "@/components/Funnel";
import CtaLink from "@/components/CtaLink";

type Offer = { titre: string; motif: "defiscalisation" | "energies"; interet: string; points: string[]; note?: string; cta: string };

// Textes qualitatifs volontairement prudents : faites-les valider, et n'ajoutez des chiffres que s'ils sont justifiables.
const OFFERS: Offer[] = [
  { titre: "Pompe à chaleur", motif: "energies", interet: "pompe_a_chaleur", cta: "Vérifier mon éligibilité",
    points: ["Consomme moins d'énergie qu'un chauffage électrique classique", "Chauffe l'hiver et peut rafraîchir l'été (modèles réversibles)", "Des aides peuvent exister selon votre logement et votre situation"],
    note: "Éligibilité étudiée au cas par cas selon les dispositifs en vigueur. Aucun résultat n'est garanti avant étude de votre dossier." },
  { titre: "Panneaux solaires", motif: "energies", interet: "solaire", cta: "Être rappelé pour le solaire",
    points: ["Produisez une partie de votre propre électricité", "Moins exposé aux hausses du prix de l'énergie", "Le surplus peut être valorisé selon les conditions en vigueur"] },
  { titre: "Défiscalisation", motif: "defiscalisation", interet: "defiscalisation", cta: "Être rappelé pour la défiscalisation",
    points: ["Réduisez votre impôt grâce à des dispositifs prévus par la loi", "Une étude de votre situation avant toute proposition", "Chaque dispositif est présenté avec ses conditions"],
    note: "Les dispositifs de défiscalisation ont des conditions et peuvent comporter un risque, y compris de perte en capital." },
];

const FAQ = [
  ["Est-ce vraiment gratuit ?", "Oui. La simulation et l'étude sont gratuites et sans engagement. Vous décidez ensuite."],
  ["Qui va m'appeler ?", "Un conseiller de [NOM DE VOTRE SOCIÉTÉ], uniquement au sujet de votre demande."],
  ["Que deviennent mes données ?", "Elles servent à traiter votre demande, sont conservées 3 ans maximum, et vous pouvez les faire supprimer à tout moment."],
];

export default function Home() {
  return (
    <>
      <header className="wrap bar"><b className="logo"><span className="spark" aria-hidden="true" />Eclafoyer</b></header>
      <main>
        <section className="wrap hero">
          <div>
            <h1>Votre situation fiscale et énergétique, étudiée gratuitement.</h1>
            <p className="lead">Répondez à quelques questions, découvrez une première estimation, puis un conseiller vous rappelle quand cela vous arrange.</p>
            <ul className="ticks"><li>Gratuit et sans engagement</li><li>Une minute pour simuler</li><li>Vous choisissez de donner suite ou non</li></ul>
          </div>
          <div id="simulateur"><Funnel /></div>
        </section>

        <section className="wrap" id="avantages">
          <h2 className="center">Ce que vous pouvez y gagner</h2>
          <div className="offers">
            {OFFERS.map((o) => (
              <article key={o.titre} className="offer">
                <h3>{o.titre}</h3>
                <ul className="ticks">{o.points.map((t) => <li key={t}>{t}</li>)}</ul>
                {o.note && <p className="note">{o.note}</p>}
                <CtaLink motif={o.motif} interet={o.interet}>{o.cta}</CtaLink>
              </article>
            ))}
          </div>
        </section>

        <section className="wrap steps">
          <h2>Comment ça se passe</h2>
          <ol><li>Vous simulez votre situation en ligne.</li><li>Vous laissez vos coordonnées pour être rappelé.</li><li>Un conseiller vous présente une étude adaptée.</li></ol>
        </section>

        <section className="wrap faq">
          <h2>Questions fréquentes</h2>
          {FAQ.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
        </section>
      </main>
      <footer className="wrap foot">Eclafoyer est un site exploité par [NOM DE VOTRE SOCIÉTÉ] · [Adresse] · [SIREN] · Mentions légales et politique de confidentialité à ajouter</footer>
    </>
  );
}
