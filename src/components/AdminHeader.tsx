import Link from "next/link";
import { signOutAdmin } from "@/app/actions/auth";
import { SITE_CONFIG } from "@/config/site";

interface AdminHeaderProps {
  adminEmail?: string;
  activeTab?: "dashboard" | "pets" | "applications";
}

export default function AdminHeader({
  adminEmail = "admin@havenpaws.org",
  activeTab = "dashboard",
}: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div className="container admin-header-inner">
        <div className="admin-header-brand">
          <Link href="/admin" className="admin-brand-link">
            <span className="admin-brand-badge">🐾 ADMIN</span>
            <span className="admin-brand-name">{SITE_CONFIG.brandName}</span>
          </Link>
          <span className="admin-env-pill">One Org • Single Admin</span>
        </div>

        <nav className="admin-nav" aria-label="Admin Navigation">
          <Link
            href="/admin"
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          >
            📊 Dashboard
          </Link>
          <Link
            href="/admin/pets"
            className={`admin-nav-item ${activeTab === "pets" ? "active" : ""}`}
          >
            🐶 Pet Listings
          </Link>
          <Link
            href="/admin/applications"
            className={`admin-nav-item ${activeTab === "applications" ? "active" : ""}`}
          >
            📝 Applications
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-item nav-ext-link"
          >
            Live Site ↗
          </Link>
        </nav>

        <div className="admin-header-user">
          <span className="admin-user-email" title={adminEmail}>
            👤 {adminEmail}
          </span>
          <form action={signOutAdmin}>
            <button type="submit" className="btn-admin-logout" aria-label="Sign out">
              Log Out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
