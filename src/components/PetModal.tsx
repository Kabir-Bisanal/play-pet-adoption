"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PetProfile } from "@/data/pets";
import { buildWhatsAppUrl } from "@/config/site";

interface PetModalProps {
  pet: PetProfile | null;
  onClose: () => void;
}

export default function PetModal({ pet, onClose }: PetModalProps) {
  useEffect(() => {
    if (!pet) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pet, onClose]);

  if (!pet) return null;

  const speciesLabel =
    pet.species === "dog"
      ? "Dog"
      : pet.species === "cat"
      ? "Cat"
      : pet.badgeLabel || "Other Animal";

  return (
    <div
      className="modal-overlay"
      id="petModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalName"
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close pet profile modal"
          type="button"
        >
          ✕
        </button>
        <div className="modal-body">
          <div className="modal-img-col">
            <img src={pet.image} alt={`${pet.name} - Adoptable pet preview`} />
          </div>
          <div className="modal-info-col">
            <h3 id="modalName">
              {pet.name}{" "}
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                }}
              >
                {pet.adoptionCode}
              </span>
            </h3>
            <p className="meta">
              {speciesLabel} • {pet.breed} • {pet.age} ({pet.gender})
            </p>

            <ul className="checklist">
              <li>
                <span className="chk-icon">✅</span>
                <span className="chk-label">Vaccination:</span>
                <span className="chk-val">{pet.vaccinationStatus}</span>
              </li>
              <li>
                <span className="chk-icon">✅</span>
                <span className="chk-label">Dewormed:</span>
                <span className="chk-val">{pet.dewormedStatus}</span>
              </li>
              <li>
                <span className="chk-icon">✅</span>
                <span className="chk-label">Spayed / Neutered:</span>
                <span className="chk-val">{pet.sterilisationStatus}</span>
              </li>
              <li>
                <span className="chk-icon">📍</span>
                <span className="chk-label">Location:</span>
                <span className="chk-val">{pet.location}</span>
              </li>
            </ul>

            <div className="modal-story">{pet.story}</div>

            <div className="modal-actions">
              <Link
                href={`/adopt/${pet.id}`}
                onClick={onClose}
                className="btn-secondary"
                style={{ justifyContent: "center", textAlign: "center" }}
              >
                View Full Profile Page →
              </Link>
              <a
                href={buildWhatsAppUrl(pet.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ justifyContent: "center" }}
              >
                <span>💬</span> Inquire on WhatsApp to Adopt
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
