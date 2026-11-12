import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SAMPLE_PETS, PetProfile } from "@/data/pets";
import { SITE_CONFIG } from "@/config/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFloatWhatsApp from "@/components/MobileFloatWhatsApp";
import PetProfileClient from "@/components/PetProfileClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Normalizes input param and finds matching pet by ID slug or adoption code.
 */
function getPetByIdOrCode(paramId: string): PetProfile | undefined {
  if (!paramId) return undefined;
  const decoded = decodeURIComponent(paramId).trim().toLowerCase();
  const cleanCode = decoded.replace(/^#/, "");

  return SAMPLE_PETS.find((pet) => {
    const idMatch = pet.id.toLowerCase() === decoded;
    const rawCodeMatch = pet.adoptionCode.toLowerCase() === decoded;
    const cleanCodeMatch =
      pet.adoptionCode.toLowerCase().replace(/^#/, "") === cleanCode;
    return idMatch || rawCodeMatch || cleanCodeMatch;
  });
}

/**
 * Next.js 15 App Router static param generation for all companions.
 */
export async function generateStaticParams() {
  return SAMPLE_PETS.map((pet) => ({
    id: pet.id,
  }));
}

/**
 * Dynamic metadata generation with OpenGraph and Twitter card support.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getPetByIdOrCode(id);

  if (!pet) {
    return {
      title: `Pet Not Found — ${SITE_CONFIG.brandName}`,
      description: "The requested rescue pet profile could not be found.",
    };
  }

  const title = `Adopt ${pet.name} (${pet.adoptionCode}) — ${SITE_CONFIG.brandName}`;
  const description = `Meet ${pet.name} (${pet.adoptionCode}), a loving ${pet.age} old ${pet.breed} in ${pet.location}. ${pet.tags.join(", ")}. Apply to adopt on ${SITE_CONFIG.brandName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [
        {
          url: pet.image,
          width: 1200,
          height: 630,
          alt: pet.alt || `${pet.name} (${pet.adoptionCode})`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [pet.image],
    },
  };
}

/**
 * Server Component Pet Profile Route
 */
export default async function PetProfilePage({ params }: PageProps) {
  const { id } = await params;
  const pet = getPetByIdOrCode(id);

  if (!pet) {
    notFound();
  }

  return (
    <div className="pet-profile-page-wrapper">
      <Header />

      <main className="profile-page-main" id="main-content">
        <div className="container">
          {/* Breadcrumb Navigation and Back Link */}
          <div className="profile-nav-bar">
            <Link href="/adopt" className="profile-back-link">
              ← Back to Adoption Directory
            </Link>

            <nav aria-label="Breadcrumb" className="profile-breadcrumbs">
              <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                  <Link href="/" className="breadcrumb-link">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="breadcrumb-separator">
                  /
                </li>
                <li className="breadcrumb-item">
                  <Link href="/adopt" className="breadcrumb-link">
                    Adopt a Pet
                  </Link>
                </li>
                <li aria-hidden="true" className="breadcrumb-separator">
                  /
                </li>
                <li className="breadcrumb-item">
                  <span aria-current="page" className="breadcrumb-current">
                    {pet.name}
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          {/* Interactive Multi-Photo Profile Client Component */}
          <PetProfileClient pet={pet} />
        </div>
      </main>

      <Footer />
      <MobileFloatWhatsApp />
    </div>
  );
}
