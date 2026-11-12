"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG, buildWhatsAppUrl } from "@/config/site";

export default function Header() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;

    const handleScroll = () => {
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
  }, []);

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
        in North Bangalore. <a href="#catalog">View Adoptable Pets</a>
      </div>

      <div className="nav-bar">
        <div className="container nav-inner">
          <a href="#top" className="logo-block">
            <div className="logo-badge">🐾</div>
            <div className="logo-text">
              <h1>{SITE_CONFIG.brandName}</h1>
              <span>{SITE_CONFIG.brandTagline}</span>
            </div>
          </a>

          <ul className="nav-links">
            <li>
              <a href="#catalog">Adopt a Pet</a>
            </li>
            <li>
              <a href="#how-it-works">Adoption Process</a>
            </li>
            <li>
              <a href="#facility">Our Care</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
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
          </div>
        </div>
      </div>
    </header>
  );
}
