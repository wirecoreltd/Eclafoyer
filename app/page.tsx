import Image from "next/image";
import Funnel from "@/components/Funnel";

const CHECK = "M5 12.5l4.5 4.5L19 7.5";
function Icon({ d, size = 24, color = "currentColor", sw = 2 }: { d: string; size?: number; color?: string; sw?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>);
}

// Photos : déposez les fichiers dans /public/images/ (salon.jpg, salle-de-bain.jpg, maison-pac.jpg). Sans fichier, un fond uni s'affiche.
const PRODUITS = [
  { titre: "Chauffage", sous: "Moins d'électricité, plus de confort", img: "/images/salon.jpg",
    points: ["Elle capte la chaleur de l'air extérieur : moins d'énergie qu'un chauffage électrique classique", "Chaud l'hiver, frais l'été avec les modèles réversibles", "Une chaleur douce et régulière, sans à-coups"] },
  { titre: "Eau chaude", sous: "Douche, salle de bain, cuisine", img: "/images/salle-de-bain.jpg",
    points: ["Selon le modèle, elle chauffe aussi votre eau sanitaire", "De l'eau chaude dans toute la maison", "Un seul équipement pour tout gérer"] },
  { titre: "Budget et valeur", sous: "Moins exposé aux hausses de prix", img: "/images/maison-pac.jpg",
    points: ["Vous dépendez moins du fioul ou du gaz, dont les prix varient", "Une meilleure performance énergétique peut valoriser votre bien", "Une facture d'énergie plus maîtrisée"] },
];

const ETAPES = [
  { d: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", t: "1. Je réponds au sondage gratuit" },
  { d: "M12 2l3 7 7 .6-5.3 4.7L18.5 22 12 18l-6.5 4 1.8-7.7L2 9.6 9 9z", t: "2. Je découvre mon éligibilité" },
  { d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z", t: "3. Un conseiller me rappelle à l'heure de mon choix" },
];

const CONDITIONS = [
  ["Propriétaire", "Occupant d'une maison ou d'un appartement."],
  ["Revenus sous plafond", "Selon la composition du foyer et le lieu d'habitation. Le sondage le vérifie pour vous."],
  ["Logement existant", "[CONDITIONS À PRÉCISER avec l'installateur : ancienneté, chauffage actuel…]"],
];

const FAQ = [
  ["Est-ce vraiment gratuit ?", "Oui. Le sondage est totalement gratuit et ne vous engage à rien. Vous décidez ensuite."],
  ["Qui va m'appeler ?", "Un conseiller de [NOM DE VOTRE SOCIÉTÉ], uniquement au sujet de votre demande, à la date et à l'heure que vous avez choisies."],
  ["Pourquoi demander mes revenus ?", "Les aides dépendent de votre revenu fiscal de référence et de la taille de votre foyer."],  
];

export default function Home() {
  return (
    <>
      <header className="top"><div className="wrap bar">
        <Image src="/logoEF.png" alt="EclaFoyer" width={184} height={46} priority />
        <span className="topnote">Sondage gratuit · sans engagement</span>
      </div></header>

      <main>
        <section className="band navy hero">
          <div className="wrap hero-in">
            <div className="hero-txt">
              <h1>Pompe à chaleur à <span className="yel">1 € symbolique</span> : êtes-vous éligible ?</h1>
              <p className="lead">Répondez à quelques questions en 2 minutes. Vous découvrez tout de suite votre profil, puis un conseiller vous rappelle à l'heure de votre choix.</p>
              <div className="pills">
                {["Totalement gratuit", "Sans engagement", "2 minutes"].map((t) => (<span className="pill" key={t}><Icon d={CHECK} size={16} color="#FFC800" sw={3} />{t}</span>))}
              </div>
              <p className="fine">Offre soumise à conditions de ressources et à validation de votre dossier par un conseiller.</p>
            </div>
            <div id="simulateur" className="hero-form"><Funnel /></div>
          </div>
        </section>

        <section className="band navy" id="avantages" style={{ paddingTop: 16 }}>
          <div className="wrap">
            <div className="h2c"><h2>Les avantages de la</h2><div className="kick yel">pompe à chaleur</div></div>
            <div className="pcards">
              {PRODUITS.map((p) => (
                <article className="pcard" key={p.titre}>
                  <div className="ph" style={{ backgroundImage: `url(${p.img})` }} role="img" aria-label={p.titre} />
                  <div className="pbody">
                    <h3>{p.titre}</h3><div className="psub">{p.sous}</div>
                    <ul>{p.points.map((t) => (<li key={t}><Icon d={CHECK} size={18} color="#FFC800" sw={3} />{t}</li>))}</ul>
                  </div>
                </article>
              ))}
            </div>
            <p className="fine center">Les performances varient selon le logement, l'équipement choisi et son installation.</p>
          </div>
        </section>

        <section className="band green">
          <div className="wrap">
            <div className="h2c"><h2>Comment ça marche</h2><div className="kick yel">en un coup d'œil</div></div>
            <div className="serv">
              {ETAPES.map((e) => (<div className="sv" key={e.t}><span className="sv-ic"><Icon d={e.d} size={26} color="#FFC800" /></span><div>{e.t}</div></div>))}
            </div>
            <div className="sepline">Un sondage gratuit, un rappel à l'heure de votre choix, aucun engagement.</div>
          </div>
        </section>

        <section className="band char bignum">
          <div className="big">1<span> €</span></div>
          <div className="bigt">symbolique pour votre pompe à chaleur</div>
          <p>Pour les ménages qui remplissent les conditions de ressources. Le sondage vous dit en 2 minutes si c'est votre cas.</p>
          <small>Sous réserve de validation de votre dossier par un conseiller.</small>
        </section>

        <section className="band mint">
          <div className="wrap">
            <div className="h2c"><h2 className="dk">Qui peut en profiter ?</h2></div>
            <div className="conds">
              {CONDITIONS.map(([t, d]) => (
                <div className="cond" key={t}><span className="cond-ic"><Icon d={CHECK} size={22} color="#10242C" sw={3} /></span><b>{t}</b><p>{d}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="band yellow cta">
          <h2>Prêt à vérifier votre éligibilité ?</h2>
          <p>Gratuit, sans engagement, en 2 minutes.</p>
          <a className="btn-dark" href="#simulateur">Commencer le sondage</a>
        </section>

        <section className="faq"><div className="faq-in">
          <div className="h2c"><h2 className="dk">Questions fréquentes</h2></div>
          {FAQ.map(([q, a]) => (<div className="faq-i" key={q}><b>{q}</b><p>{a}</p></div>))}
        </div></section>
      </main>

      <footer className="foot">
        <div className="tel">[TÉLÉPHONE]</div>
        EclaFoyer est un site exploité par [NOM DE VOTRE SOCIÉTÉ] · [Adresse] · [SIREN] · Mentions légales · Politique de confidentialité
      </footer>
    </>
  );
}
