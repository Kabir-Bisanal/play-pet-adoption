import type { Metadata } from "next";
import { getCurrentAdmin } from "@/app/actions/auth";
import AdminHeader from "@/components/AdminHeader";
import AdminPetForm from "@/components/AdminPetForm";
import { SITE_CONFIG } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Add New Rescue Companion — ${SITE_CONFIG.brandName} Admin`,
  description: "Intake form to add a newly rescued companion to public listings.",
};

export default async function AdminNewPetPage() {
  const admin = await getCurrentAdmin();
  const adminEmail = admin?.email || "admin@havenpaws.org";

  return (
    <div className="admin-page-wrapper">
      <AdminHeader adminEmail={adminEmail} activeTab="pets" />

      <main className="admin-main container">
        <AdminPetForm mode="create" />
      </main>
    </div>
  );
}
