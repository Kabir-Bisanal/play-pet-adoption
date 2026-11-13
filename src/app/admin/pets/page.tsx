import type { Metadata } from "next";
import { getCurrentAdmin } from "@/app/actions/auth";
import { getAllPetsForAdmin } from "@/lib/pets";
import AdminHeader from "@/components/AdminHeader";
import AdminPetCatalogClient from "@/components/AdminPetCatalogClient";
import { SITE_CONFIG } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Manage Pet Listings — ${SITE_CONFIG.brandName} Admin`,
  description: "Rescue companion inventory, status management, and new arrivals intake.",
};

export default async function AdminPetsPage() {
  const [admin, pets] = await Promise.all([
    getCurrentAdmin(),
    getAllPetsForAdmin(),
  ]);

  const adminEmail = admin?.email || "admin@havenpaws.org";

  return (
    <div className="admin-page-wrapper">
      <AdminHeader adminEmail={adminEmail} activeTab="pets" />

      <main className="admin-main container">
        <AdminPetCatalogClient initialPets={pets} />
      </main>
    </div>
  );
}
