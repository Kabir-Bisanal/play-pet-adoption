"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG, buildWhatsAppUrl } from "@/config/site";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/adopt", label: "Adopt a Pet" },
  { href: "/process", label: "Process" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/about", label: "About" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;

    const handleScroll = () => {
      if (menuOpen) return;

      const currentScrollY =
        window.pageYOffset || document.documentElement.scrollTop;

      if (currentScrollY <= 45) {
        setHidden(false);
      } else if (
        currentScrollY > lastScrollY &&
        currentScrollY - lastScrollY > 6
      ) {
        setHidden(true);
      } else if (lastScrollY - currentScrollY > 6) {
        setHidden(false);
      }

      lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const headerWaUrl = buildWhatsAppUrl(
    `Hi ${SITE_CONFIG.brandName} team, I'm looking to adopt a pet!`
  );

  return (
    <header
      className={`site-header${hidden ? " header-hidden" : ""}`}
      id="siteHeader"
    >
      <div className="top-bar">
        🐾 We currently have 25+ rescue dogs &amp; cats ready for forever homes
        in North Bangalore. <Link href="/adopt">View Adoptable Pets</Link>
      </div>

      <div className="nav-bar">
        <div className="container nav-inner">
          <Link href="/" className="logo-block">
            <div className="logo-badge">🐾</div>
            <div className="logo-text">
              <h1>{SITE_CONFIG.brandName}</h1>
              <span>{SITE_CONFIG.brandTagline}</span>
            </div>
          </Link>

          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={pathname === item.href ? "active" : ""}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-cta">
            <a
              href={headerWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa-header"
            >
              <span>💬</span> Chat to Adopt
            </a>

            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mobile-drawer" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
