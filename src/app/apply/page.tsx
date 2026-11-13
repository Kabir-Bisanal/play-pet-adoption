import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import { getPets } from "@/lib/pets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFloatWhatsApp from "@/components/MobileFloatWhatsApp";
import AdoptionApplicationForm from "@/components/AdoptionApplicationForm";

export const metadata: Metadata = {
  title: `Apply to Adopt — ${SITE_CONFIG.brandName}`,
  description:
    "Submit your online adoption application to welcome a rescued dog, puppy, cat, or kitten from Haven Paws into your forever home.",
};

interface ApplyPageProps {
  searchParams: Promise<{ pet?: string }>;
}

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const { pet: petParam } = await searchParams;
  const pets = await getPets();

  return (
    <div className="apply-page-wrapper">
      <Header />

      <main className="apply-page-main" id="main-content">
        <div className="container">
          {/* Breadcrumb Navigation */}
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
                  Adoption Application
                </span>
              </li>
            </ol>
          </nav>

          {/* Page Hero Header */}
          <div className="apply-hero-header">
            <span className="apply-eyebrow">Adoption Application</span>
            <h1 className="apply-title">Give a Haven Paws Rescue a Forever Home</h1>
            <p className="apply-subtitle">
              Takes about 3 minutes to complete. Our North Bangalore caretakers review
              every application within 24 hours to ensure a joyful, safe, lifelong match.
            </p>
          </div>

          {/* Interactive Form Component */}
          <div className="apply-form-container">
            <Suspense fallback={<p style={{ color: "var(--text-muted)" }}>Loading application form...</p>}>
              <AdoptionApplicationForm pets={pets} initialPetSlug={petParam || ""} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
      <MobileFloatWhatsApp />
    </div>
  );
}
