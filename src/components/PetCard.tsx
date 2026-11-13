"use client";

import Link from "next/link";
import { PetProfile } from "@/data/pets";
import { buildWhatsAppUrl } from "@/config/site";

interface PetCardProps {
  pet: PetProfile;
  onViewProfile?: (pet: PetProfile) => void;
  priority?: boolean;
}

export default function PetCard({ pet, onViewProfile, priority = false }: PetCardProps) {
  const speciesClass =
    pet.species === "cat"
      ? "badge-species cat"
      : pet.species === "other"
      ? "badge-species other"
      : "badge-species";

  return (
    <div className="pet-card" data-species={pet.species}>
      <div
        className="pet-image-wrap"
        onClick={() => onViewProfile?.(pet)}
        style={{ cursor: onViewProfile ? "pointer" : "default" }}
      >
        <span className="badge-status">
          <span className="status-dot" /> Available
        </span>
        <span className={speciesClass}>
          {pet.badgeLabel}
        </span>
        <img
          src={pet.image}
          alt={pet.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          width={400}
          height={320}
        />
      </div>
      <div className="pet-card-body">
        <div className="pet-header">
          <div className="pet-header-left">
            <h4 className="pet-name">
              <Link href={`/adopt/${pet.id}`}>{pet.name}</Link>
            </h4>
            <span className="pet-card-id">{pet.adoptionCode}</span>
          </div>
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
          <Link href={`/adopt/${pet.id}`} className="btn-card-view">
            Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
