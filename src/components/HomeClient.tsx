"use client";

import { useState } from "react";
import { PetProfile, SAMPLE_PETS } from "@/data/pets";
import { SITE_CONFIG, buildWhatsAppUrl } from "@/config/site";
import Header from "./Header";
import Footer from "./Footer";
import PetModal from "./PetModal";

type FilterCategory = "all" | "dog" | "cat";

export default function HomeClient() {
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);

  const visiblePets =
    filter === "all"
      ? SAMPLE_PETS
      : SAMPLE_PETS.filter((pet) => pet.species === filter);

  const dogCount = SAMPLE_PETS.filter((p) => p.species === "dog").length;
  const catCount = SAMPLE_PETS.filter((p) => p.species === "cat").length;

  const mobileFloatWaUrl = buildWhatsAppUrl(
    `Hi ${SITE_CONFIG.brandName} team, I'm interested in adopting a pet!`
  );

  return (
    <div id="top">
      <Header />

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badges">
              <div className="hero-badge-pill">📍 {SITE_CONFIG.regionLabel}</div>
              <div className="hero-badge-pill">✅ Vaccinated &amp; Dewormed</div>
            </div>
            <h2>
              Every rescue deserves a <em>loving forever home.</em>
            </h2>
            <p>
              Meet our adorable rescue puppies and kittens nurtured on open,
              safe lawns in North Bangalore. Browse our adoptable companions,
              chat with our care team on WhatsApp, and schedule a play visit.
            </p>
            <div className="hero-cta-group">
              <a href="#catalog" className="btn-primary">
                <span>🐾</span> Explore Pets Available Now
              </a>
              <a href="#how-it-works" className="btn-secondary">
                How Adoption Works
              </a>
            </div>
          </div>

          {/* Hero Media: Group Photo (7.jpeg) */}
          <div className="hero-media-wrapper">
            <div className="hero-image-card">
              <img
                src="/images/7.jpeg"
                alt="The Rajanukunte Litter - 5 rescued puppies together"
                fetchPriority="high"
              />
              <div className="hero-floating-tag">
                <div>
                  <strong>The Rajanukunte Five</strong>
                  <span>Rescued sibling pups looking for homes</span>
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--brand-forest)",
                  }}
                >
                  <span className="status-dot" /> 5 Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="catalog-section" id="catalog">
        <div className="container">
          <div className="section-header">
            <div className="section-title">
              <span>Adoptable Companions</span>
              <h3>Meet Your Future Best Friend</h3>
            </div>

            {/* Filter Bar */}
            <div
              className="filter-bar"
              role="tablist"
              aria-label="Pet species filters"
            >
              <button
                type="button"
                className={`filter-btn${filter === "all" ? " active" : ""}`}
                role="tab"
                aria-selected={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All Pets ({SAMPLE_PETS.length})
              </button>
              <button
                type="button"
                className={`filter-btn${filter === "dog" ? " active" : ""}`}
                role="tab"
                aria-selected={filter === "dog"}
                onClick={() => setFilter("dog")}
              >
                Puppies &amp; Dogs ({dogCount})
              </button>
              <button
                type="button"
                className={`filter-btn${filter === "cat" ? " active" : ""}`}
                role="tab"
                aria-selected={filter === "cat"}
                onClick={() => setFilter("cat")}
              >
                Cats &amp; Kittens ({catCount})
              </button>
            </div>
          </div>

          {/* Pet Cards Grid */}
          <div className="pet-grid" id="petGrid">
            {visiblePets.map((pet) => (
              <div className="pet-card" key={pet.id} data-species={pet.species}>
                <div className="pet-image-wrap">
                  <span className="badge-status">
                    <span className="status-dot" /> Available
                  </span>
                  <span
                    className={`badge-species${
                      pet.species === "cat" ? " cat" : ""
                    }`}
                  >
                    {pet.badgeLabel}
                  </span>
                  <img
                    src={pet.image}
                    alt={pet.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="pet-card-body">
                  <div className="pet-header">
                    <h4 className="pet-name">{pet.name}</h4>
                    <span className="pet-age">{pet.age}</span>
                  </div>
                  <p className="pet-breed">
                    {pet.breed} • {pet.gender} • {pet.color}
                  </p>
                  <div className="pet-tags">
                    {pet.tags.map((tag) => (
                      <span className="pet-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="pet-card-footer">
                    <a
                      href={buildWhatsAppUrl(pet.whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-card-wa"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                    <button
                      type="button"
                      className="btn-card-view"
                      onClick={() => setSelectedPet(pet)}
                    >
                      Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="process-section" id="how-it-works">
        <div className="container">
          <div className="process-header">
            <span className="process-eyebrow">Smooth &amp; Caring</span>
            <h3>Our Adoption Journey</h3>
            <p>
              We ensure our animals and adoptive families are a joyful, lifelong
              match through a friendly, guided process.
            </p>
          </div>

          <div className="process-grid">
            <div className="process-card">
              <div className="process-step-num">01</div>
              <h4>Find Your Match</h4>
              <p>
                Browse our verified profiles. Pick the puppy or kitten whose
                energy and temperament fits your home lifestyle.
              </p>
            </div>

            <div className="process-card">
              <div className="process-step-num">02</div>
              <h4>WhatsApp Chat</h4>
              <p>
                Click the WhatsApp button on your chosen pet. Our caretakers
                will answer questions and share recent video clips.
              </p>
            </div>

            <div className="process-card">
              <div className="process-step-num">03</div>
              <h4>Meet &amp; Greet Visit</h4>
              <p>
                Visit our open green facility near Rajanukunte. Spend time
                playing and bonding with the pet in person.
              </p>
            </div>

            <div className="process-card">
              <div className="process-step-num">04</div>
              <h4>Welcome Home</h4>
              <p>
                Complete simple paperwork, receive their vaccination record, and
                take home your new family member!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sanctuary & Care Banner */}
      <section className="facility-banner" id="facility">
        <div className="container">
          <div className="facility-card">
            <div>
              <span className="facility-eyebrow">Nurtured with Love</span>
              <h3>Raised on Open Green Grounds</h3>
              <p>
                Unlike crowded city shelters, our rescue animals live on
                spacious outdoor lawns in North Bangalore. They get daily
                playtime, supervised socialisation, and veterinary care before
                meeting their new families.
              </p>
              <a
                href="#catalog"
                className="btn-primary"
                style={{
                  background: "#FFFFFF",
                  color: "var(--brand-forest)",
                }}
              >
                Browse Available Rescues →
              </a>
            </div>

            <div className="facility-perks">
              <div className="perk-box">
                <strong>Open Green Lawns</strong>
                <span>
                  Safe space to run, play, and develop strong social skills.
                </span>
              </div>
              <div className="perk-box">
                <strong>Socialised &amp; Happy</strong>
                <span>
                  Daily interaction with caretakers and fellow puppies.
                </span>
              </div>
              <div className="perk-box">
                <strong>Health First</strong>
                <span>
                  Regular deworming, scheduled shots, and vet checkups.
                </span>
              </div>
              <div className="perk-box">
                <strong>Post-Adoption Guidance</strong>
                <span>
                  Ongoing support from experienced handlers for new pet parents.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Floating Mobile WhatsApp Button */}
      <a
        href={mobileFloatWaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mobile-float-wa"
      >
        <span>💬</span> Adopt via WhatsApp
      </a>

      <PetModal pet={selectedPet} onClose={() => setSelectedPet(null)} />
    </div>
  );
}
