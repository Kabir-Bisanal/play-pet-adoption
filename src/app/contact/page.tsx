import type { Metadata } from "next";
import { SITE_CONFIG, buildWhatsAppUrl } from "@/config/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFloatWhatsApp from "@/components/MobileFloatWhatsApp";
import ContactFormClient from "@/components/ContactFormClient";

export const metadata: Metadata = {
  title: `Contact Us — ${SITE_CONFIG.brandName}`,
  description:
    "Get in touch with our North Bangalore rescue team to ask adoption questions or schedule a meet-and-greet visit.",
};

export default function ContactPage() {
  const directWaUrl = buildWhatsAppUrl(
    `Hi ${SITE_CONFIG.brandName} team, I'd like to get in touch regarding pet adoption.`
  );

  return (
    <div>
      <Header />
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-eyebrow">Get In Touch</span>
          <h2>Contact Our Care Team</h2>
          <p>
            Whether you want to meet a puppy in person, ask about a cat&apos;s
            habits, or get guidance before adopting, we&apos;re happy to chat.
          </p>
        </div>
      </div>

      <section className="page-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info-card">
              <h3>Direct Contact Details</h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.92rem",
                  marginBottom: "24px",
                }}
              >
                Visits to our North Bangalore facility are by prior appointment
                so a handler can dedicate relaxed time to introduce you to the
                animals.
              </p>

              <ul
                className="checklist"
                style={{ marginBottom: "24px", background: "var(--bg-canvas)" }}
              >
                <li>
                  <span className="chk-icon">📞</span>
                  <span className="chk-label">Phone / WhatsApp:</span>
                  <a
                    href={`tel:+${SITE_CONFIG.whatsappNumber}`}
                    className="chk-val"
                    style={{ textDecoration: "underline" }}
                  >
                    {SITE_CONFIG.displayPhone}
                  </a>
                </li>
                <li>
                  <span className="chk-icon">✉️</span>
                  <span className="chk-label">Email:</span>
                  <a
                    href={`mailto:${SITE_CONFIG.contactEmail}`}
                    className="chk-val"
                    style={{ textDecoration: "underline" }}
                  >
                    {SITE_CONFIG.contactEmail}
                  </a>
                </li>
                <li>
                  <span className="chk-icon">📍</span>
                  <span className="chk-label">Location:</span>
                  <span className="chk-val">{SITE_CONFIG.fullAddress}</span>
                </li>
                <li>
                  <span className="chk-icon">🕙</span>
                  <span className="chk-label">Visiting Hours:</span>
                  <span className="chk-val">
                    Tue – Sun, 10:00 AM – 5:30 PM (By Appointment)
                  </span>
                </li>
              </ul>

              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-card-wa"
                style={{ width: "100%", padding: "12px 18px" }}
              >
                <span>💬</span> Chat Directly on WhatsApp
              </a>
            </div>

            <ContactFormClient />
          </div>
        </div>
      </section>

      <Footer />
      <MobileFloatWhatsApp />
    </div>
  );
}
