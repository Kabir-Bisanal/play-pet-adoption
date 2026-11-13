import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAdmin } from "@/app/actions/auth";
import { getPetById } from "@/lib/pets";
import AdminHeader from "@/components/AdminHeader";
import AdminPetForm from "@/components/AdminPetForm";
import { SITE_CONFIG } from "@/config/site";

export const dynamic = "force-dynamic";

interface AdminEditPetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: AdminEditPetPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = await getPetById(id);
  const name = pet?.name || "Companion";
  return {
    title: `Edit ${name} — ${SITE_CONFIG.brandName} Admin`,
    description: `Update profile, photos, and adoption status for ${name}.`,
  };
}

export default async function AdminEditPetPage({ params }: AdminEditPetPageProps) {
  const { id } = await params;
  const [admin, pet] = await Promise.all([
    getCurrentAdmin(),
    getPetById(id),
  ]);

  const adminEmail = admin?.email || "admin@havenpaws.org";

  if (!pet) {
    return (
      <div className="admin-page-wrapper">
        <AdminHeader adminEmail={adminEmail} activeTab="pets" />
        <main className="admin-main container">
          <div className="admin-empty-catalog">
            <span className="admin-empty-icon">⚠️</span>
            <h2 className="admin-empty-heading">Companion Not Found</h2>
            <p className="admin-empty-sub">
              We couldn&apos;t find a rescue companion with identifier &ldquo;{id}&rdquo;.
            </p>
            <Link href="/admin/pets" className="btn-admin-action primary">
              ← Return to Pet Directory
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page-wrapper">
      <AdminHeader adminEmail={adminEmail} activeTab="pets" />

      <main className="admin-main container">
        <AdminPetForm mode="edit" initialData={pet} />
      </main>
    </div>
  );
}
