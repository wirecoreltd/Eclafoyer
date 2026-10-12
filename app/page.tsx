import Image from "next/image";
import Funnel from "@/components/Funnel";

const CHECK = "M5 12.5l4.5 4.5L19 7.5";
function Icon({ d, size = 24, color = "currentColor", sw = 2 }: { d: string; size?: number; color?: string; sw?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>);
}
const Tick = ({ size = 14 }: { size?: number }) => (<span className="tick"><Icon d={CHECK} size={size} color="#fff" sw={3.2} /></span>);

// Nombre d'installateurs partenaires : à modifier ici, il est repris partout sur la page.
const NB_INSTALLATEURS = "100+";

// Photos : déposez les fichiers dans /public/images/ (salon.jpg, salle-de-bain.jpg, maison-pac.jpg). Sans fichier, un fond dégradé s'affiche.
const PRODUITS = [
  { titre: "Chauffage", sous: "Moins d'électricité, plus de confort", img: "/images/salon.jpg",
    points: ["Elle capte la chaleur de l'air extérieur : moins d'énergie qu'un chauffage électrique classique", "Chaud l'hiver, frais l'été avec les modèles réversibles", "Une chaleur douce et régulière, sans à-coups"] },
  { titre: "Eau chaude", sous: "Douche, salle de bain, cuisine", img: "/images/salle-de-bain.jpg",
    points: ["Selon le modèle, elle chauffe aussi votre eau sanitaire", "De l'eau chaude dans toute la maison", "Un seul équipement pour tout gérer"] },
  { titre: "Budget et valeur", sous: "Moins exposé aux hausses de prix", img: "/images/maison-pac.jpg",
    points: ["Vous dépendez moins du fioul ou du gaz, dont les prix varient", "Une meilleure performance énergétique peut valoriser votre bien", "Une facture d'énergie plus maîtrisée"] },
];

const ETAPES = [
  { d: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", t: "Je réponds au sondage", s: "2 minutes, gratuit et sans engagement." },
  { d: "M12 2l3 7 7 .6-5.3 4.7L18.5 22 12 18l-6.5 4 1.8-7.7L2 9.6 9 9z", t: "Je découvre mon éligibilité", s: "Votre profil s'affiche tout de suite." },
  { d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z", t: "Un conseiller me rappelle", s: "À la date et à l'heure de mon choix." },
];

const RESEAU = [
  ["Partout en France", "Notre réseau couvre l'ensemble du territoire pour intervenir près de chez vous."],
  ["Un seul point d'entrée", "Vous répondez une fois au sondage, un conseiller fait le lien avec l'installateur adapté."],
  ["Sans engagement", "Vous comparez, vous décidez. Rien n'est signé à la fin du sondage."],
];

const CONDITIONS = [
  ["Propriétaire", "Occupant d'une maison ou d'un appartement."],
  ["Revenus sous plafond", "Selon la composition du foyer et le lieu d'habitation. Le sondage le vérifie pour vous."],
  ["Logement existant", "[CONDITIONS À PRÉCISER avec l'installateur : ancienneté, chauffage actuel…]"],
];

const FAQ = [
  ["Est-ce vraiment gratuit ?", "Oui. Le sondage est totalement gratuit et ne vous engage à rien. Vous décidez ensuite."],
  ["Qui va m'appeler ?", "Un conseiller de [NOM DE VOTRE SOCIÉTÉ], uniquement au sujet de votre demande, à la date et à l'heure que vous avez choisies."],
  ["Qui réalise les travaux ?", `Nous travaillons avec plus de 100 installateurs partenaires à travers la France. Le conseiller vous explique quel installateur peut intervenir dans votre secteur.`],
  ["Pourquoi demander mes revenus ?", "Les aides dépendent de votre revenu fiscal de référence et de la taille de votre foyer."],
];

export default function Home() {
  return (
    <>
      <header className="top"><div className="wrap bar">
        <a href="#top" aria-label="EclaFoyer, accueil"><Image src="/logoEF.png" alt="EclaFoyer" width={168} height={42} priority /></a>
        <nav className="nav" aria-label="Navigation principale">
          <a href="#comment">Comment ça marche</a><a href="#avantages">Avantages</a><a href="#reseau">Nos installateurs</a><a href="#faq">FAQ</a>
        </nav>
        <a className="cta-btn sm" href="#simulateur">Je vérifie</a>
      </div></header>

      <main id="top">
        {/* 1. Hero */}
        <section className="hero">
          <div className="wrap hero-in">
            <div className="hero-txt">
              <div className="netchip"><b>{NB_INSTALLATEURS}</b> installateurs partenaires partout en France</div>
              <h1>Pompe à chaleur à <em>1 € symbolique</em> : êtes-vous éligible ?</h1>
              <p className="lead">Répondez à quelques questions en 2 minutes. Vous découvrez tout de suite votre profil, puis un conseiller vous rappelle à l'heure de votre choix.</p>
              <ul className="ticks">
                {["Totalement gratuit", "Sans engagement", "Un installateur proche de chez vous"].map((t) => (<li key={t}><Tick />{t}</li>))}
              </ul>
              <p className="fine">Offre soumise à conditions de ressources et à validation de votre dossier par un conseiller.</p>
            </div>
            <div id="simulateur" className="hero-form"><Funnel /></div>
          </div>
        </section>

        {/* 2. Chiffres clés */}
        <section className="stats" aria-label="Chiffres clés">
          <div className="wrap stats-in">
            <div className="stat"><b>{NB_INSTALLATEURS}</b><span>installateurs partenaires</span></div>
            <div className="stat"><b>France</b><span>entière</span></div>
            <div className="stat"><b>2 min</b><span>pour le sondage</span></div>
            <div className="stat"><b>0 €</b><span>pour vérifier votre éligibilité</span></div>
          </div>
        </section>

        {/* 3. Comment ça marche */}
        <section className="sec" id="comment">
          <div className="wrap">
            <div className="sec-h"><span className="eyebrow">En un coup d'œil</span><h2>Comment ça marche</h2></div>
            <div className="steps">
              {ETAPES.map((e, i) => (
                <div className="step" key={e.t}>
                  <span className="step-n">{i + 1}</span>
                  <span className="step-ic"><Icon d={e.d} size={26} /></span>
                  <h3>{e.t}</h3><p>{e.s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Offre 1 € */}
        <section className="sec alt">
          <div className="wrap">
            <div className="offer">
              <div className="big">1<span> €</span></div>
              <div>
                <h2>symbolique pour votre pompe à chaleur</h2>
                <p>Pour les ménages qui remplissent les conditions de ressources. Le sondage vous dit en 2 minutes si c'est votre cas.</p>
                <small>Sous réserve de validation de votre dossier par un conseiller.</small>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Avantages */}
        <section className="sec" id="avantages">
          <div className="wrap">
            <div className="sec-h"><span className="eyebrow">Pompe à chaleur</span><h2>Les avantages pour votre maison</h2></div>
            <div className="pcards">
              {PRODUITS.map((p) => (
                <article className="pcard" key={p.titre}>
                  <div className="ph" style={{ backgroundImage: `url(${p.img})` }} role="img" aria-label={p.titre} />
                  <div className="pbody">
                    <h3>{p.titre}</h3><div className="psub">{p.sous}</div>
                    <ul>{p.points.map((t) => (<li key={t}><Icon d={CHECK} size={18} color="#7DB955" sw={3} />{t}</li>))}</ul>
                  </div>
                </article>
              ))}
            </div>
            <p className="fine center" style={{ marginTop: 26 }}>Les performances varient selon le logement, l'équipement choisi et son installation.</p>
          </div>
        </section>

        {/* 6. Réseau d'installateurs */}
        <section className="sec" id="reseau" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="network">
              <div>
                <div className="net-num">{NB_INSTALLATEURS}</div>
                <div className="net-lbl">installateurs partenaires à travers la France</div>
                <p className="net-sub">Un réseau national, pour trouver un professionnel près de chez vous.</p>
              </div>
              <div className="net-list">
                {RESEAU.map(([t, d]) => (<div className="net-item" key={t}><Tick size={18} /><div><b>{t}</b><p>{d}</p></div></div>))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. Conditions */}
        <section className="sec alt">
          <div className="wrap">
            <div className="sec-h"><span className="eyebrow">Éligibilité</span><h2>Qui peut en profiter ?</h2></div>
            <div className="conds">
              {CONDITIONS.map(([t, d]) => (
                <div className="cond" key={t}><span className="cond-ic"><Icon d={CHECK} size={22} color="#fff" sw={3} /></span><b>{t}</b><p>{d}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section className="sec" id="faq">
          <div className="wrap">
            <div className="sec-h"><span className="eyebrow">FAQ</span><h2>Questions fréquentes</h2></div>
            <div className="faq-in">
              {FAQ.map(([q, a]) => (<details className="faq-i" key={q}><summary>{q}</summary><p>{a}</p></details>))}
            </div>
          </div>
        </section>

        {/* 9. CTA final */}
        <section className="wrap" style={{ paddingBottom: 0 }}>
          <div className="final">
            <h2>Prêt à vérifier votre éligibilité ?</h2>
            <p>Gratuit, sans engagement, en 2 minutes. Plus de 100 installateurs partenaires en France.</p>
            <a className="cta-btn" href="#simulateur">Commencer le sondage</a>
          </div>
        </section>
      </main>

      <footer className="foot">© EclaFoyer · Tous droits réservés · <a href="/mentions-legales">Mentions légales</a> · <a href="/confidentialite">Politique de confidentialité</a></footer>
    </>
  );
}
