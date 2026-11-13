"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { PetProfile } from "@/data/pets";
import { buildWhatsAppUrl, SITE_CONFIG } from "@/config/site";

export interface PetProfileClientProps {
  pet: PetProfile;
}

export default function PetProfileClient({ pet }: PetProfileClientProps) {
  // Normalize gallery images with fallback to primary pet.image
  const galleryImages: string[] =
    Array.isArray(pet.gallery) && pet.gallery.length > 0
      ? pet.gallery
      : [pet.image];

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Active hero image guard
  const activeImage = galleryImages[selectedIdx] || pet.image;

  const handlePrevImage = useCallback(() => {
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  }, [galleryImages.length]);

  const handleNextImage = useCallback(() => {
    setSelectedIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  }, [galleryImages.length]);

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;

    const shareData = {
      title: `Adopt ${pet.name} (${pet.adoptionCode}) — ${SITE_CONFIG.brandName}`,
      text: `Meet ${pet.name}, an adorable ${pet.breed} looking for a forever home in Bangalore!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard write failure
    }
  }, [pet.name, pet.adoptionCode, pet.breed]);

  // Construct official WhatsApp inquiry URL with fallback message
  const inquiryMessage =
    pet.whatsappMessage ||
    `Hi ${SITE_CONFIG.brandName} team, I fell in love with ${pet.name} (${pet.adoptionCode}) on your adoption website! Can we schedule a visit to meet?`;
  const whatsAppInquiryUrl = buildWhatsAppUrl(inquiryMessage);

  const quickStepsCard = (extraClass: string) => (
    <div className={`profile-quick-steps ${extraClass}`}>
      <h4 className="quick-steps-title">🐾 Haven Paws Adoption Journey</h4>
      <ol className="quick-steps-list">
        <li>
          <strong>1. WhatsApp Chat:</strong> Send inquiry with code{" "}
          {pet.adoptionCode}
        </li>
        <li>
          <strong>2. Consultation:</strong> Discuss lifestyle, home environment
          &amp; safety
        </li>
        <li>
          <strong>3. Meet &amp; Greet:</strong> Interactive play session at our
          Bangalore facility
        </li>
        <li>
          <strong>4. Welcome Home:</strong> Formal adoption pledge &amp;
          post-adoption support
        </li>
      </ol>
    </div>
  );

  return (
    <div className="pet-profile-client">
      <div className="profile-grid">
        {/* ================= LEFT COLUMN: MULTI-PHOTO GALLERY ================= */}
        <div className="profile-gallery-col">
          <div className="profile-gallery-card">
            {/* Hero Image Container */}
            <div className="profile-hero-wrap">
              {/* Overlay Badges */}
              <div className="profile-hero-badges">
                <span className="badge-status">
                  <span className="status-dot" /> Available
                </span>
                <span
                  className={`badge-species${
                    pet.species === "cat"
                      ? " cat"
                      : pet.species === "other"
                      ? " other"
                      : ""
                  }`}
                >
                  {pet.badgeLabel}
                </span>
              </div>

              {/* Photo Counter */}
              {galleryImages.length > 1 && (
                <span className="profile-hero-counter">
                  📷 {selectedIdx + 1} / {galleryImages.length}
                </span>
              )}

              {/* Hero Image */}
              <img
                src={activeImage}
                alt={`${pet.name} - Photo ${selectedIdx + 1} of ${
                  galleryImages.length
                }`}
                className="profile-hero-img"
              />

              {/* Cycle Controls */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="gallery-nav-btn prev"
                    aria-label="Previous photo"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="gallery-nav-btn next"
                    aria-label="Next photo"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Interactive Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div
                className="profile-thumbnails"
                role="tablist"
                aria-label={`${pet.name} photo gallery thumbnails`}
              >
                {galleryImages.map((imgSrc, idx) => {
                  const isActive = idx === selectedIdx;
                  return (
                    <button
                      key={`${imgSrc}-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`View photo ${idx + 1} of ${pet.name}`}
                      className={`profile-thumb-btn ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => setSelectedIdx(idx)}
                    >
                      <img
                        src={imgSrc}
                        alt={`${pet.name} preview ${idx + 1}`}
                        className="profile-thumb-img"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Adoption Process Banner (Desktop left column) */}
            {quickStepsCard("desktop-only-steps")}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: PET DETAILS & CTAS ================= */}
        <div className="profile-details-col">
          {/* Header & Prominent Pet ID Badge */}
          <div className="profile-header">
            <div className="profile-title-row">
              <h1 className="profile-pet-name">{pet.name}</h1>
              <span
                className="profile-id-badge"
                title="Official Pet Adoption Reference Code"
              >
                {pet.adoptionCode}
              </span>
            </div>
            <p className="profile-pet-subtitle">
              {pet.species === "cat"
                ? "Feline Companion"
                : pet.species === "dog"
                ? "Canine Companion"
                : "Rescued Small Animal"}{" "}
              • {pet.breed} • {pet.location}
            </p>
          </div>

          {/* Vitals Grid */}
          <div className="profile-vitals-grid">
            <div className="vital-card">
              <span className="vital-label">Age</span>
              <strong className="vital-value">{pet.age}</strong>
            </div>
            <div className="vital-card">
              <span className="vital-label">Breed</span>
              <strong className="vital-value">{pet.breed}</strong>
            </div>
            <div className="vital-card">
              <span className="vital-label">Gender</span>
              <strong className="vital-value">{pet.gender}</strong>
            </div>
            <div className="vital-card">
              <span className="vital-label">Size</span>
              <strong className="vital-value">{pet.size}</strong>
            </div>
            <div className="vital-card">
              <span className="vital-label">Coat Color</span>
              <strong className="vital-value">{pet.color}</strong>
            </div>
            <div className="vital-card">
              <span className="vital-label">Location</span>
              <strong className="vital-value">{pet.location}</strong>
            </div>
          </div>

          {/* Personality Tags */}
          {pet.tags && pet.tags.length > 0 && (
            <div className="profile-section">
              <h3 className="section-label">Personality & Temperament</h3>
              <div className="profile-tags-wrap">
                {pet.tags.map((tag) => (
                  <span key={tag} className="profile-tag">
                    ✨ {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Health Status Badges */}
          <div className="profile-section">
            <h3 className="section-label">Health & Preventive Care</h3>
            <div className="health-badges-grid">
              <div className="health-badge-card">
                <div className="health-badge-header">
                  <span className="health-icon">💉</span>
                  <span className="health-title">Vaccination</span>
                </div>
                <p className="health-val">{pet.vaccinationStatus}</p>
              </div>
              <div className="health-badge-card">
                <div className="health-badge-header">
                  <span className="health-icon">🛡️</span>
                  <span className="health-title">Dewormed</span>
                </div>
                <p className="health-val">{pet.dewormedStatus}</p>
              </div>
              <div className="health-badge-card">
                <div className="health-badge-header">
                  <span className="health-icon">🩺</span>
                  <span className="health-title">Sterilisation</span>
                </div>
                <p className="health-val">{pet.sterilisationStatus}</p>
              </div>
            </div>
          </div>

          {/* Rescue Backstory Narrative */}
          {pet.story && (
            <div className="profile-section-card">
              <div className="section-card-header">
                <span className="section-card-icon">📖</span>
                <div>
                  <h3 className="section-card-title">Meet {pet.name}</h3>
                  <p className="section-card-sub">Backstory & rescue journey</p>
                </div>
              </div>
              <p className="profile-story-text">{pet.story}</p>
            </div>
          )}

          {/* Clinical Timeline & Medical History */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <span className="section-card-icon">📋</span>
              <div>
                <h3 className="section-card-title">Clinical History & Records</h3>
                <p className="section-card-sub">
                  Documented veterinary checks, preventative shots, and health milestones
                </p>
              </div>
            </div>
            {pet.medicalHistory && pet.medicalHistory.length > 0 ? (
              <ul className="profile-timeline-list">
                {pet.medicalHistory.map((entry, idx) => (
                  <li key={idx} className="timeline-item">
                    <span className="timeline-marker" aria-hidden="true" />
                    <span className="timeline-text">{entry}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="timeline-empty">
                Full veterinary history and health passport available upon initial consultation.
              </p>
            )}
          </div>

          {/* Dedicated Adoption Requirements Section */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <span className="section-card-icon">🏡</span>
              <div>
                <h3 className="section-card-title">Adoption Requirements</h3>
                <p className="section-card-sub">
                  Criteria to ensure a safe, lifelong home environment for {pet.name}
                </p>
              </div>
            </div>
            {pet.adoptionRequirements && pet.adoptionRequirements.length > 0 ? (
              <ul className="profile-requirements-list">
                {pet.adoptionRequirements.map((req, idx) => (
                  <li key={idx} className="requirement-item">
                    <span className="requirement-check" aria-hidden="true">
                      ✓
                    </span>
                    <span className="requirement-text">{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="requirements-empty">
                Standard adoption interview and home safety check apply.
              </p>
            )}
          </div>

          {/* Direct WhatsApp Adoption Inquiry CTA Card */}
          <div className="profile-cta-card">
            <span className="profile-cta-badge">Ready for Forever Love?</span>
            <h3 className="profile-cta-title">Adopt {pet.name} Today</h3>
            <p className="profile-cta-desc">
              Connect directly with our North Bangalore adoption coordinators via
              WhatsApp. Your inquiry automatically includes pet reference{" "}
              <strong>{pet.adoptionCode}</strong>.
            </p>
            <div className="profile-cta-actions">
              <a
                href={whatsAppInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa-profile"
              >
                <span>💬</span> Inquire on WhatsApp to Adopt {pet.name} ({pet.adoptionCode})
              </a>
              <Link
                href={`/apply?pet=${pet.id}`}
                prefetch={true}
                className="btn-apply-profile"
                aria-label={`Apply to adopt ${pet.name} online`}
              >
                <span>📝</span> Apply to Adopt Online (3-Min Form)
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="btn-share-profile"
                aria-label={`Share ${pet.name}'s profile`}
              >
                <span>🔗</span> {copied ? "Link Copied!" : "Share Profile"}
              </button>
            </div>
            <p className="profile-cta-footer">
              Official Helpline: {SITE_CONFIG.displayPhone} • Shelter Location: {pet.location}
            </p>
          </div>

          {/* Quick Adoption Process Banner (Mobile/Tablet after CTA) */}
          {quickStepsCard("mobile-only-steps")}
        </div>
      </div>
    </div>
  );
}
