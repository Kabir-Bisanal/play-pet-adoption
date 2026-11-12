import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFloatWhatsApp from "@/components/MobileFloatWhatsApp";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: `FAQs — ${SITE_CONFIG.brandName}`,
  description:
    "Common questions about adopting a rescue dog or cat, vaccinations, apartment living, and visits in Bangalore.",
};

export default function FaqsPage() {
  return (
    <div>
      <Header />
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-eyebrow">Helpful Answers</span>
          <h2>Frequently Asked Questions</h2>
          <p>
            Everything new pet parents usually ask before bringing a rescue
            puppy, dog, or cat home.
          </p>
        </div>
      </div>

      <section className="page-section">
        <div className="container">
          <FaqAccordion />

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "16px",
                fontSize: "0.98rem",
              }}
            >
              Still unsure about something specific?
            </p>
            <Link href="/contact" className="btn-primary">
              Ask Our Care Team →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileFloatWhatsApp />
    </div>
  );
}
