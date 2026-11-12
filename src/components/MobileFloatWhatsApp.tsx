import { SITE_CONFIG, buildWhatsAppUrl } from "@/config/site";

export default function MobileFloatWhatsApp() {
  const waUrl = buildWhatsAppUrl(
    `Hi ${SITE_CONFIG.brandName} team, I'm interested in adopting a pet!`
  );

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mobile-float-wa"
    >
      <span>💬</span> Adopt via WhatsApp
    </a>
  );
}
