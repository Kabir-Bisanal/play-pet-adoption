import { Suspense } from "react";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/config/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFloatWhatsApp from "@/components/MobileFloatWhatsApp";
import AdoptCatalogClient from "@/components/AdoptCatalogClient";

export const metadata: Metadata = {
  title: `Adopt a Pet — ${SITE_CONFIG.brandName}`,
  description:
    "Browse rescued dogs, puppies, cats, and kittens available for adoption in North Bangalore.",
};

export default function AdoptPage() {
  return (
    <div>
      <Header />
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-eyebrow">Adoption Directory</span>
          <h2>Meet Pets Ready for a Forever Home</h2>
          <p>
            Every dog and cat here is cared for in person by our team. Click
            any profile to read their personality, medical notes, and backstory.
          </p>
        </div>
      </div>

      <section className="page-section">
        <div className="container">
          <Suspense
            fallback={
              <p style={{ color: "var(--text-muted)" }}>Loading pets...</p>
            }
          >
            <AdoptCatalogClient />
          </Suspense>
        </div>
      </section>

      <Footer />
      <MobileFloatWhatsApp />
    </div>
  );
}
