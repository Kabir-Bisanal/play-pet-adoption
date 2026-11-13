import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAdmin } from "@/app/actions/auth";
import { getAdminDashboardData } from "@/lib/admin";
import AdminHeader from "@/components/AdminHeader";
import { SITE_CONFIG } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Admin Dashboard — ${SITE_CONFIG.brandName}`,
  description: "Rescue administration and adoption management overview.",
};

export default async function AdminDashboardPage() {
  const [admin, dashboardData] = await Promise.all([
    getCurrentAdmin(),
    getAdminDashboardData(),
  ]);

  const { stats, recentApplications, recentPets } = dashboardData;
  const adminEmail = admin?.email || "admin@havenpaws.org";

  return (
    <div className="admin-page-wrapper">
      <AdminHeader adminEmail={adminEmail} activeTab="dashboard" />

      <main className="admin-main container">
        {/* Top Welcome & Quick Actions Bar */}
        <div className="admin-welcome-bar">
          <div>
            <span className="admin-welcome-eyebrow">Overview &amp; Metrics</span>
            <h1 className="admin-welcome-title">Rescue Operations Dashboard</h1>
            <p className="admin-welcome-desc">
              Managing North Bangalore rescue intake, public listings, and adoption pipelines.
            </p>
          </div>

          <div className="admin-quick-actions">
            <Link href="/admin/pets/new" className="btn-admin-action primary">
              <span>➕</span> Add New Pet
            </Link>
            <Link href="/admin/applications" className="btn-admin-action secondary">
              <span>📋</span> Applications
              {stats.newApplications > 0 && (
                <span className="admin-badge-count">{stats.newApplications}</span>
              )}
            </Link>
          </div>
        </div>

        {/* 4 Live KPI Metric Cards */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="kpi-icon-wrap" aria-hidden="true">
              🐾
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Total Rescues in Care</span>
              <span className="kpi-value">{stats.totalPets}</span>
              <span className="kpi-meta">Catalog inventory</span>
            </div>
          </div>

          <div className="admin-kpi-card highlight-green">
            <div className="kpi-icon-wrap" aria-hidden="true">
              🏡
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Available for Adoption</span>
              <span className="kpi-value">{stats.availablePets}</span>
              <span className="kpi-meta text-forest">Ready for forever homes</span>
            </div>
          </div>

          <div className="admin-kpi-card highlight-coral">
            <div className="kpi-icon-wrap" aria-hidden="true">
              📝
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Adoption Applications</span>
              <span className="kpi-value">{stats.totalApplications}</span>
              <span className="kpi-meta">
                {stats.newApplications > 0 ? (
                  <strong className="text-coral">
                    ● {stats.newApplications} awaiting review
                  </strong>
                ) : (
                  "All applications reviewed"
                )}
              </span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon-wrap" aria-hidden="true">
              💛
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Forever Homes Placed</span>
              <span className="kpi-value">{stats.adoptedCount}</span>
              <span className="kpi-meta">Success stories archived</span>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Recent Applications & Current Pets */}
        <div className="admin-sections-grid">
          {/* Recent Applications Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Recent Adoption Inquiries</h3>
                <p className="admin-card-subtitle">
                  Latest online applications submitted by prospective adopters.
                </p>
              </div>
              <Link href="/admin/applications" className="admin-card-link">
                View All Applications →
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="admin-empty-box">
                <span className="admin-empty-icon">📭</span>
                <p className="admin-empty-text">
                  No applications received yet. Submissions from the 12-field online
                  form will appear here in real time.
                </p>
                <Link href="/apply" target="_blank" className="admin-btn-test-link">
                  Open Public Application Form ↗
                </Link>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Companion</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <strong>{app.applicantName}</strong>
                          <span className="table-subtext">{app.applicantPhone}</span>
                        </td>
                        <td>
                          <span className="table-pet-badge">{app.petCode}</span>{" "}
                          {app.petName}
                        </td>
                        <td>{app.city}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              app.status === "new" ? "status-new" : "status-review"
                            }`}
                          >
                            {app.status === "new" ? "New" : app.status}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={`/admin/applications#${app.id}`}
                            className="btn-table-action"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Current Pets Overview Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Rescue Companions</h3>
                <p className="admin-card-subtitle">
                  Recently added or updated pets in your live database.
                </p>
              </div>
              <Link href="/admin/pets" className="admin-card-link">
                Manage Pet Inventory →
              </Link>
            </div>

            <div className="admin-pets-list">
              {recentPets.map((pet) => (
                <div key={pet.id} className="admin-pet-item">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="admin-pet-thumb"
                  />
                  <div className="admin-pet-details">
                    <div className="admin-pet-header">
                      <h4 className="admin-pet-name">{pet.name}</h4>
                      <span className="admin-pet-code">{pet.adoptionCode}</span>
                    </div>
                    <span className="admin-pet-species">
                      {pet.breed} • {pet.species}
                    </span>
                  </div>
                  <div className="admin-pet-status">
                    <span
                      className={`status-pill ${
                        pet.status === "available"
                          ? "status-available"
                          : "status-other"
                      }`}
                    >
                      {pet.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
