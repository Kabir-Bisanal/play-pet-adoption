import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFloatWhatsApp from "@/components/MobileFloatWhatsApp";

export const metadata: Metadata = {
  title: `About Us — ${SITE_CONFIG.brandName}`,
  description:
    "Learn how our North Bangalore rescue team cares for, socialises, and rehomes abandoned dogs and cats.",
};

export default function AboutPage() {
  return (
    <div>
      <Header />
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-eyebrow">Who We Are</span>
          <h2>Small Team. Big Open Lawns. Honest Care.</h2>
          <p>
            {SITE_CONFIG.brandName} started with a simple goal in North
            Bangalore: rescue vulnerable puppies, dogs, and cats—and give them
            room to grow, heal, and trust humans before finding their families.
          </p>
        </div>
      </div>

      <section className="page-section">
        <div className="container">
          <div className="about-grid">
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: "2rem",
                  color: "var(--brand-forest)",
                  marginBottom: "16px",
                }}
              >
                No Cages. Just Patience, Playtime, and Good Food.
              </h3>
              <p
                style={{
                  color: "var(--text-main)",
                  marginBottom: "16px",
                  fontSize: "1rem",
                }}
              >
                Too often, rescue animals spend months locked in noisy kennels,
                which makes them anxious and harder for new families to
                understand. At our Rajanukunte and Devanahalli care grounds, our
                animals get daily lawn sessions, quiet indoor sleeping corners,
                and steady human company.
              </p>
              <p
                style={{
                  color: "var(--text-muted)",
                  marginBottom: "24px",
                  fontSize: "0.98rem",
                }}
              >
                Because our handlers spend real hours with each animal every
                day, we don&apos;t guess at their personalities. We tell you
                plainly who loves belly rubs, who gets shy around loud traffic,
                and who gets along best with kids or older pets.
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link href="/adopt" className="btn-primary">
                  <span>🐾</span> Meet Our Rescues
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Plan a Visit
                </Link>
              </div>
            </div>

            <div className="about-photo">
              <img
                src="/images/7.jpeg"
                alt="Five rescued puppies sitting together outdoors in North Bangalore"
              />
            </div>
          </div>

          <div className="why-grid" style={{ marginTop: "56px" }}>
            <div className="why-card">
              <div className="why-icon">🩺</div>
              <h4>Vet Care Comes First</h4>
              <p>
                Every rescue gets deworming, tick/flea treatment, and timely
                core vaccinations from trusted local vets.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">🤝</div>
              <h4>Match Over Speed</h4>
              <p>
                We would rather wait two extra weeks for the right household
                than rush a puppy into a stressful situation.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">✂️</div>
              <h4>Responsible Sterilisation</h4>
              <p>
                Spaying and neutering at the right age is part of every adoption
                pledge to curb street overpopulation humanely.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">💬</div>
              <h4>Lifetime Check-ins</h4>
              <p>
                Once you adopt, you stay on our WhatsApp support line for diet
                questions, training tips, and vet referrals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileFloatWhatsApp />
    </div>
  );
}
