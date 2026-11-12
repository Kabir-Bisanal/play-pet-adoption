import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFloatWhatsApp from "@/components/MobileFloatWhatsApp";
import { SITE_CONFIG, buildWhatsAppUrl } from "@/config/site";

export const metadata: Metadata = {
  title: `Page Not Found — ${SITE_CONFIG.brandName}`,
  description:
    "The page or pet profile you were looking for is unavailable. Explore other loving rescue companions ready for adoption.",
};

export default function NotFound() {
  const whatsappHelpUrl = buildWhatsAppUrl(
    `Hi ${SITE_CONFIG.brandName} team, I was trying to find a page or pet on your website that seems to have moved. Could you help me?`
  );

  return (
    <div>
      <Header />

      <main className="not-found-section">
        <div className="container">
          <div className="not-found-card">
            <div className="not-found-icon" aria-hidden="true">
              🐾
            </div>
            <span className="not-found-eyebrow">404 Error • Page Not Found</span>
            <h1 className="not-found-title">Looks Like This Trail Went Cold</h1>
            <p className="not-found-desc">
              The pet profile or page you are looking for may have found their
              forever family, moved to another section, or taken a playful
              detour across our lawns.
            </p>

            <div className="not-found-actions">
              <Link href="/adopt" className="btn-primary">
                <span>🐾</span> Browse Available Pets
              </Link>
              <Link href="/process" className="btn-secondary">
                How Adoption Works
              </Link>
              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa-header"
              >
                <span>💬</span> Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileFloatWhatsApp />
    </div>
  );
}
