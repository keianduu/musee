import Link from "next/link";
import { getDashboardData } from "@/lib/admin/queries";

export default async function AdminDashboard() {
  const result = await getDashboardData();
  const metrics = [
    ["All exhibitions", result.data.total], ["Draft", result.data.draft],
    ["Image missing", result.data.imageMissing], ["Ready", result.data.ready],
    ["Published", result.data.published],
  ] as const;
  return <>
    <div className="page-head"><div><p className="eyebrow">Production content</p><h1>Admin Dashboard</h1></div></div>
    {!result.configured && <div className="notice">Supabase未接続です。.env.localを設定し、migrationを適用してください。</div>}
    {result.error && result.configured && <div className="error">{result.error}</div>}
    <section className="metrics">{metrics.map(([label, value]) => <div className="metric" key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>
    <section className="card"><h2>Admin v0 workflow</h2><p className="muted">Art Commonsを取り込み、画像候補を人が調査し、Rightsを承認したPrimary画像と必須情報が揃った展覧会だけを公開できます。</p><div className="actions"><Link className="button" href="/admin/imports">Importを開始</Link><Link className="button secondary" href="/admin/exhibitions">Draftを確認</Link></div></section>
    {result.data.lastImport && <section><h2>Latest import</h2><pre>{JSON.stringify(result.data.lastImport, null, 2)}</pre></section>}
  </>;
}
