import Link from "next/link";
import { SITE_CONFIG, buildWhatsAppUrl } from "@/config/site";

export default function Footer() {
  const visitWaUrl = buildWhatsAppUrl(
    `Hi ${SITE_CONFIG.brandName}, I'd like to schedule a visit to meet the adoptable pets.`
  );

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h4>🐾 {SITE_CONFIG.brandName}</h4>
            <p>
              {SITE_CONFIG.brandTagline} — Connecting rescued dogs and cats with
              compassionate forever families in North Bangalore and beyond.
            </p>
            <p style={{ fontSize: "0.85rem", color: "#D3E4DB" }}>
              📞 <strong>Call / WhatsApp:</strong>{" "}
              <a
                href={`tel:+${SITE_CONFIG.whatsappNumber}`}
                style={{ color: "#FFDEB5", textDecoration: "underline" }}
              >
                {SITE_CONFIG.displayPhone}
              </a>
              <br />
              ✉️ <strong>Email:</strong>{" "}
              <a
                href={`mailto:${SITE_CONFIG.contactEmail}`}
                style={{ color: "#FFDEB5", textDecoration: "underline" }}
              >
                {SITE_CONFIG.contactEmail}
              </a>
              <br />
              📍 {SITE_CONFIG.fullAddress}
            </p>
          </div>

          <div className="footer-col">
            <h5>Adopt</h5>
            <ul>
              <li>
                <Link href="/adopt">All Adoptable Pets</Link>
              </li>
              <li>
                <Link href="/adopt?species=dog">Puppies &amp; Dogs</Link>
              </li>
              <li>
                <Link href="/adopt?species=cat">Cats &amp; Kittens</Link>
              </li>
              <li>
                <Link href="/success-stories">Success Stories</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Learn More</h5>
            <ul>
              <li>
                <Link href="/process">7-Step Adoption Process</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/faqs">FAQs</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Schedule a Visit</h5>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#A89E97",
                marginBottom: "12px",
              }}
            >
              Come meet the pets on our open lawns. Prior appointment via
              WhatsApp recommended.
            </p>
            <a
              href={visitWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-card-wa"
              style={{ display: "inline-flex" }}
            >
              <span>💬</span> Book a Visit
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} {SITE_CONFIG.brandName}. All rights
            reserved.
          </div>
          <div>Designed with compassion for rescue animals in Bangalore.</div>
        </div>
      </div>
    </footer>
  );
}
