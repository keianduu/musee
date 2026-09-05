import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">
    <header className="admin-header">
      <Link className="brand" href="/admin">muuzee / admin</Link>
      <nav className="admin-nav" aria-label="Admin navigation">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/imports">Imports</Link>
        <Link href="/admin/exhibitions">Exhibitions</Link>
        <Link href="/admin/venues">Venues</Link>
      </nav>
    </header>
    <main className="admin-main">{children}</main>
  </div>;
}
