"use client";

import { useState } from "react";
import Link from "next/link";
import { PetProfile, SAMPLE_PETS } from "@/data/pets";
import {
  ADOPTION_PROCESS_STEPS,
  SAMPLE_SUCCESS_STORIES,
  WHY_ADOPT_ITEMS,
} from "@/data/content";
import { SITE_CONFIG } from "@/config/site";
import Header from "./Header";
import Footer from "./Footer";
import PetCard from "./PetCard";
import PetModal from "./PetModal";
import MobileFloatWhatsApp from "./MobileFloatWhatsApp";

type FilterCategory = "all" | "dog" | "cat";

interface HomeClientProps {
  initialPets?: PetProfile[];
  initialStories?: typeof SAMPLE_SUCCESS_STORIES;
}

export default function HomeClient({ initialPets, initialStories }: HomeClientProps = {}) {
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);

  const pets = initialPets && initialPets.length > 0 ? initialPets : SAMPLE_PETS;
  const stories = initialStories && initialStories.length > 0 ? initialStories : SAMPLE_SUCCESS_STORIES;

  const visiblePets =
    filter === "all"
      ? pets
      : pets.filter((pet) => pet.species === filter);

  const dogCount = pets.filter((p) => p.species === "dog").length;
  const catCount = pets.filter((p) => p.species === "cat").length;

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
              Give a pet a <em>forever home.</em>
            </h2>
            <p>
              Meet our adorable rescue puppies and kittens nurtured on open,
              safe lawns in North Bangalore. Browse our adoptable companions,
              chat with our care team on WhatsApp, and schedule a play visit.
            </p>
            <div className="hero-cta-group">
              <Link href="/adopt" className="btn-primary">
                <span>🐾</span> Explore Pets Available Now
              </Link>
              <Link href="/process" className="btn-secondary">
                How Adoption Works
              </Link>
            </div>
          </div>

          {/* Hero Media: Group Photo (7.jpeg) */}
          <div className="hero-media-wrapper">
            <div className="hero-image-card">
              <img
                src="/images/7.jpeg"
                alt="The Rajanukunte Litter - 5 rescued puppies together"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                width={600}
                height={450}
              />
              <div className="hero-floating-tag">
                <div>
                  <strong>Recently Added: The Rajanukunte Five</strong>
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

      {/* Featured & Recently Added Pets Catalog */}
      <section className="catalog-section" id="catalog">
        <div className="container">
          <div className="section-header">
            <div className="section-title">
              <span>Featured &amp; Recently Added</span>
              <h3>Meet Your Future Best Friend</h3>
            </div>

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

          <div className="pet-grid" id="petGrid">
            {visiblePets.map((pet, idx) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onViewProfile={(chosen) => setSelectedPet(chosen)}
                priority={idx < 2}
              />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "36px" }}>
            <Link href="/adopt" className="btn-secondary">
              Browse Full Adoption Directory →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Adopt Instead of Buying */}
      <section
        className="why-section"
        style={{
          background: "var(--bg-subtle)",
          borderTop: "1px solid var(--border-soft)",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <div className="container">
          <div className="process-header" style={{ marginBottom: "20px" }}>
            <span className="process-eyebrow">Make a Real Difference</span>
            <h3>Why Adopt Instead of Buying?</h3>
            <p>
              Choosing adoption means welcoming a companion who truly needs a
              family—with honest handler insights and full vet transparency.
            </p>
          </div>

          <div className="why-grid">
            {WHY_ADOPT_ITEMS.map((item) => (
              <div className="why-card" key={item.title}>
                <div className="why-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Adoption Works Preview */}
      <section className="process-section" id="how-it-works" style={{ background: "var(--bg-canvas)", border: "none" }}>
        <div className="container">
          <div className="process-header">
            <span className="process-eyebrow">Transparent &amp; Guided</span>
            <h3>How Adoption Works</h3>
            <p>
              We follow a thoughtful 7-step journey so every animal and family
              begins together with confidence.
            </p>
          </div>

          <div className="process-grid">
            {ADOPTION_PROCESS_STEPS.slice(0, 4).map((item) => (
              <div className="process-card" key={item.step}>
                <div className="process-step-num">{item.step}</div>
                <h4>{item.title}</h4>
                <p>{item.summary}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link href="/process" className="btn-secondary">
              See Full 7-Step Adoption Process →
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Adopted Success Stories */}
      <section
        className="stories-section"
        style={{
          background: "var(--bg-subtle)",
          borderTop: "1px solid var(--border-soft)",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <div className="container">
          <div className="section-header">
            <div className="section-title">
              <span>Happy Tails</span>
              <h3>Recently Adopted Success Stories</h3>
            </div>
            <Link href="/success-stories" className="btn-secondary">
              View All Stories →
            </Link>
          </div>

          <div className="stories-grid">
            {stories.map((story) => (
              <article className="story-card" key={story.id}>
                <div className="story-img-wrap">
                  <span className="story-badge">Adopted • {story.adoptedDate}</span>
                  <img
                    src={story.image}
                    alt={`${story.petName} with ${story.adopterNames}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="story-body">
                  <h4>{story.petName}</h4>
                  <div className="story-meta">
                    Adopted by {story.adopterNames} • {story.neighborhood}
                  </div>
                  <div className="story-before">{story.beforeNote}</div>
                  <p className="story-quote">&ldquo;{story.afterQuote}&rdquo;</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Adoption Enquiry Banner */}
      <section className="facility-banner" id="facility">
        <div className="container">
          <div className="facility-card">
            <div>
              <span className="facility-eyebrow">Questions Before Adopting?</span>
              <h3>We&apos;re Here to Help You Find the Right Match</h3>
              <p>
                Not sure whether a young puppy or an independent cat fits your
                routine? Reach out to our handlers or explore our FAQs to get
                honest guidance before visiting.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href="/contact"
                  className="btn-primary"
                  style={{
                    background: "#FFFFFF",
                    color: "var(--brand-forest)",
                  }}
                >
                  Send Adoption Enquiry →
                </Link>
                <Link
                  href="/faqs"
                  className="btn-secondary"
                  style={{
                    background: "transparent",
                    color: "#FFFFFF",
                    borderColor: "rgba(255,255,255,0.35)",
                  }}
                >
                  Read FAQs
                </Link>
              </div>
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
      <MobileFloatWhatsApp />
      <PetModal pet={selectedPet} onClose={() => setSelectedPet(null)} />
    </div>
  );
}
