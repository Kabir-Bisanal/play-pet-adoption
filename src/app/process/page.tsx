import type { Metadata } from "next";
import Link from "next/link";
import { ADOPTION_PROCESS_STEPS } from "@/data/content";
import { SITE_CONFIG, buildWhatsAppUrl } from "@/config/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFloatWhatsApp from "@/components/MobileFloatWhatsApp";

export const metadata: Metadata = {
  title: `Adoption Process — ${SITE_CONFIG.brandName}`,
  description:
    "Our 7-step rescue adoption process from application and home assessment to meet-and-greet and handover.",
};

export default function ProcessPage() {
  const startWaUrl = buildWhatsAppUrl(
    `Hi ${SITE_CONFIG.brandName} team, I'd like to learn more about starting an adoption application.`
  );

  return (
    <div>
      <Header />
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-eyebrow">Step-by-Step Guide</span>
          <h2>Our 7-Step Adoption Process</h2>
          <p>
            We keep things transparent, warm, and thorough so every dog and cat
            lands in a safe, permanent home—and every adopter feels supported.
          </p>
        </div>
      </div>

      <section className="page-section">
        <div className="container">
          <div className="timeline-grid">
            {ADOPTION_PROCESS_STEPS.map((item) => (
              <div className="timeline-card" key={item.step}>
                <div className="timeline-num">{item.step}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "48px",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-soft)",
              borderRadius: "var(--radius-lg)",
              padding: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              <h3
                style={{
                  color: "var(--brand-forest)",
                  fontSize: "1.4rem",
                  marginBottom: "6px",
                }}
              >
                Ready to take the first step?
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Browse the puppies and kittens currently waiting for families, or
                reach out directly on WhatsApp.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/adopt" className="btn-primary">
                <span>🐾</span> Browse Adoptable Pets
              </Link>
              <a
                href={startWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <span>💬</span> Message Care Team
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileFloatWhatsApp />
    </div>
  );
}
