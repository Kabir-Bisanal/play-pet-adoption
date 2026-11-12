"use client";

import { PetProfile } from "@/data/pets";
import { buildWhatsAppUrl } from "@/config/site";

interface PetCardProps {
  pet: PetProfile;
  onViewProfile: (pet: PetProfile) => void;
}

export default function PetCard({ pet, onViewProfile }: PetCardProps) {
  return (
    <div className="pet-card" data-species={pet.species}>
      <div className="pet-image-wrap">
        <span className="badge-status">
          <span className="status-dot" /> Available
        </span>
        <span className={`badge-species${pet.species === "cat" ? " cat" : ""}`}>
          {pet.badgeLabel}
        </span>
        <img src={pet.image} alt={pet.alt} loading="lazy" decoding="async" />
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
            onClick={() => onViewProfile(pet)}
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}
