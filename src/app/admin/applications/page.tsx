import type { Metadata } from "next";
import { getCurrentAdmin } from "@/app/actions/auth";
import { getAdminApplications, getActivityLogs } from "@/app/actions/applications";
import AdminHeader from "@/components/AdminHeader";
import AdminApplicationsClient from "@/components/AdminApplicationsClient";
import { SITE_CONFIG } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Adoption Applications — ${SITE_CONFIG.brandName}`,
  description: "Screen, review, and manage incoming pet adoption applications.",
};

export default async function AdminApplicationsPage() {
  const [admin, applicationsData, activityLogs] = await Promise.all([
    getCurrentAdmin(),
    getAdminApplications("all", ""),
    getActivityLogs(25),
  ]);

  const adminEmail = admin?.email || "admin@havenpaws.org";

  return (
    <div className="admin-page-wrapper">
      <AdminHeader adminEmail={adminEmail} activeTab="applications" />

      <main className="admin-main container">
        <AdminApplicationsClient
          initialApplications={applicationsData.applications}
          initialMetrics={applicationsData.metrics}
          initialActivityLogs={activityLogs}
        />
      </main>
    </div>
  );
}
