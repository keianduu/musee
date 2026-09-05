"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function VenueEnrichmentForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setResult("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/venues/enrich", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: Number(form.get("limit")) }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || "Enrichment failed");
      setResult(JSON.stringify(body, null, 2)); router.refresh();
    } catch (error) { setResult(error instanceof Error ? error.message : "Enrichment failed"); }
    finally { setBusy(false); }
  }
  return <form className="card" onSubmit={submit}><h2>Batch Venue Enrichment</h2><div className="actions"><div className="field"><label htmlFor="limit">件数（1–50）</label><input id="limit" name="limit" type="number" min="1" max="50" defaultValue="20" /></div><button className="button" disabled={busy}>{busy ? "補完中…" : "Venue情報を補完"}</button></div><p className="muted">未処理または古いVenueから順に逐次処理します。外部API画像は未確認Candidateのままです。</p>{result && <pre className="result">{result}</pre>}</form>;
}
