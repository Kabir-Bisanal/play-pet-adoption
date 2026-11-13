import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFloatWhatsApp from "@/components/MobileFloatWhatsApp";
import { getSuccessStories } from "@/lib/pets";

export const metadata: Metadata = {
  title: `Success Stories — ${SITE_CONFIG.brandName}`,
  description:
    "Happy endings and adopter stories from families across Bangalore who gave our rescues a forever home.",
};

export default async function SuccessStoriesPage() {
  const stories = await getSuccessStories();

  return (
    <div>
      <Header />
      <div className="page-hero">
        <div className="container">
          <span className="page-hero-eyebrow">Happy Tails</span>
          <h2>Forever Homes Found</h2>
          <p>
            Every dog and cat we place stays part of our extended family. Here
            are a few recent rescues settling into life across Bangalore.
          </p>
        </div>
      </div>

      <section className="page-section">
        <div className="container">
          <div className="stories-grid">
            {stories.map((story) => (
              <article className="story-card" key={story.id}>
                <div className="story-img-wrap">
                  <span className="story-badge">
                    {story.speciesLabel} • {story.adoptedDate}
                  </span>
                  <img
                    src={story.image}
                    alt={`${story.petName} adopted by ${story.adopterNames}`}
                  />
                </div>
                <div className="story-body">
                  <h4>{story.petName}</h4>
                  <div className="story-meta">
                    Adopted by {story.adopterNames} • {story.neighborhood}
                  </div>
                  <div className="story-before">
                    <strong>Before:</strong> {story.beforeNote}
                  </div>
                  <p className="story-quote">&ldquo;{story.afterQuote}&rdquo;</p>
                </div>
              </article>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link href="/adopt" className="btn-primary">
              <span>🐾</span> Meet Pets Waiting Today
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileFloatWhatsApp />
    </div>
  );
}
