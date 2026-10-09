"use client";
import { useState } from "react";

type Opt = { value: string; label: string };

export default function StatutSelect({ id, value, options }: { id: string; value: string; options: Opt[] }) {
  const [v, setV] = useState(value);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function change(next: string) {
    const prev = v;
    setV(next);
    setState("saving");
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: next }),
    });
    if (res.ok) setState("idle");
    else { setV(prev); setState("error"); }
  }

  // Si la valeur en base n'est pas dans la liste, on l'affiche quand même.
  const opts = options.some((o) => o.value === v) ? options : [{ value: v, label: v || "—" }, ...options];
  return (
    <span>
      <select value={v} disabled={state === "saving"} onChange={(e) => change(e.target.value)} style={{ font: "inherit", padding: "4px 6px", borderRadius: 8, border: "1px solid var(--line)" }}>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {state === "error" && <span className="err" style={{ marginLeft: 6 }}>Échec</span>}
    </span>
  );
}
