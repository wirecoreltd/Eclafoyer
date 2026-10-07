import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads", robots: { index: false } };

export default async function Admin() {
  const { data, error } = await supabaseAdmin().from("leads").select("*").order("created_at", { ascending: false }).limit(500);
  const leads = data ?? [];
  return (
    <main className="wrap" style={{ paddingBlock: 32 }}>
      <h1>Leads ({leads.length})</h1>
      {error && <p className="err">Lecture impossible : {error.message}</p>}
      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>Date</th><th>Motif</th><th>Intérêt</th><th>Nom</th><th>Téléphone</th><th>E-mail</th><th>Ville</th><th>Statut</th></tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                <td>{l.motif === "energies" ? "Énergies" : "Défiscalisation"}</td>
                <td>{l.simulation?.interet ?? ""}</td>
                <td>{l.prenom} {l.nom}</td>
                <td><a href={`tel:${l.telephone}`}>{l.telephone}</a></td>
                <td>{l.email}</td>
                <td>{l.code_postal} {l.ville}</td>
                <td>{l.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
