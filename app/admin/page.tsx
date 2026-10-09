import { STATUTS, STATUT_LABELS, fetchLeads, phoneNational, readFilters } from "@/lib/leads-admin";
import StatutSelect from "./StatutSelect";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads", robots: { index: false } };

const field: React.CSSProperties = { font: "inherit", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff" };
const button: React.CSSProperties = { ...field, fontWeight: 700, cursor: "pointer", background: "var(--ink)", color: "#fff", border: 0, textDecoration: "none", display: "inline-block" };

export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = readFilters(await searchParams);
  const { data, error, count } = await fetchLeads(filters);
  const leads = data ?? [];

  const exportQs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();
  const options = STATUTS.map((s) => ({ value: s, label: STATUT_LABELS[s] }));

  return (
    <main className="wrap" style={{ paddingBlock: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Leads ({count ?? leads.length})</h1>
        <a href={`/api/admin/leads/export${exportQs ? "?" + exportQs : ""}`} style={button}>⬇ Exporter en CSV</a>
      </div>

      <form method="get" style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "20px 0" }}>
        <input name="q" defaultValue={filters.q} placeholder="Nom, téléphone, e-mail, ville, CP…" style={{ ...field, minWidth: 260 }} />
        <select name="statut" defaultValue={filters.statut ?? ""} style={field}>
          <option value="">Tous les statuts</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select name="motif" defaultValue={filters.motif ?? ""} style={field}>
          <option value="">Tous les motifs</option>
          <option value="energies">Énergies</option>
          <option value="defiscalisation">Défiscalisation</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>Du <input type="date" name="du" defaultValue={filters.du} style={field} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>au <input type="date" name="au" defaultValue={filters.au} style={field} /></label>
        <button type="submit" style={button}>Filtrer</button>
        <a href="/admin" style={{ ...field, textDecoration: "none", color: "var(--ink)" }}>Réinitialiser</a>
      </form>

      {error && <p className="err">Lecture impossible : {error.message}</p>}
      {count != null && count > leads.length && <p className="err">Seuls les {leads.length} derniers leads sont affichés. Affinez les filtres ou utilisez l’export CSV (jusqu’à 10 000).</p>}

      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr><th>Date</th><th>Rappel souhaité</th><th>Nom</th><th>Téléphone</th><th>E-mail</th><th>Ville</th><th>Motif</th><th>Éligible</th><th>Réponses</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const s = (l.simulation ?? {}) as Record<string, string | number>;
              return (
                <tr key={l.id}>
                  <td>{new Date(l.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td>{s.rappel_date ? `${new Date(String(s.rappel_date) + "T12:00:00").toLocaleDateString("fr-FR")} ${s.rappel_heure ?? ""}` : ""}</td>
                  <td>{l.prenom} {l.nom}</td>
                  <td><a href={`tel:${l.telephone}`}>{phoneNational(l.telephone)}</a></td>
                  <td>{l.email ? <a href={`mailto:${l.email}`}>{l.email}</a> : ""}</td>
                  <td>{l.code_postal} {l.ville}</td>
                  <td>{l.motif === "energies" ? "Énergies" : "Défiscalisation"}</td>
                  <td>{s.eligible_pac_1_euro ?? ""}</td>
                  <td>{Object.entries(s).filter(([k]) => !["interet", "rappel_date", "rappel_heure", "eligible_pac_1_euro"].includes(k)).map(([k, v]) => `${k}: ${v}`).join(" | ")}</td>
                  <td><StatutSelect id={l.id} value={l.statut ?? "nouveau"} options={options} /></td>
                </tr>
              );
            })}
            {leads.length === 0 && <tr><td colSpan={10} style={{ padding: 24, color: "var(--mut)" }}>Aucun lead pour ces filtres.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
