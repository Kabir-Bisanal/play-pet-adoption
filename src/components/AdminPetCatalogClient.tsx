"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AdminPetItem } from "@/lib/pets";
import { PetStatus } from "@/lib/supabase/types";
import { updatePetStatus, deletePet, markPetAsAdopted, PetActionResult } from "@/app/actions/pet-management";

interface AdminPetCatalogClientProps {
  initialPets: AdminPetItem[];
}

type FilterTab = "all" | "available" | "pending" | "adopted" | "draft" | "archived";

export default function AdminPetCatalogClient({ initialPets }: AdminPetCatalogClientProps) {
  const [pets, setPets] = useState<AdminPetItem[]>(initialPets);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Adoption celebration modal state
  const [adoptingPet, setAdoptingPet] = useState<AdminPetItem | null>(null);
  const [adoptionModalState, setAdoptionModalState] = useState<{
    adopterNames: string;
    neighborhood: string;
    adoptedDate: string;
    afterQuote: string;
    error: string | null;
    isSubmitting: boolean;
  }>({
    adopterNames: "",
    neighborhood: "Bangalore",
    adoptedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    afterQuote: "",
    error: null,
    isSubmitting: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Filter & Search Logic
  const filteredPets = pets.filter((pet) => {
    // Tab filtering
    if (activeTab === "available" && pet.status !== "available") return false;
    if (activeTab === "pending" && pet.status !== "pending") return false;
    if (activeTab === "adopted" && pet.status !== "adopted") return false;
    if (activeTab === "draft" && pet.status !== "draft") return false;
    if (activeTab === "archived" && pet.status !== "archived") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = pet.name.toLowerCase().includes(q);
      const matchCode = pet.adoptionCode.toLowerCase().includes(q);
      const matchBreed = pet.breed.toLowerCase().includes(q);
      const matchSpecies = pet.species.toLowerCase().includes(q);
      return matchName || matchCode || matchBreed || matchSpecies;
    }

    return true;
  });

  // Tab counts
  const tabCounts = {
    all: pets.length,
    available: pets.filter((p) => p.status === "available").length,
    pending: pets.filter((p) => p.status === "pending").length,
    adopted: pets.filter((p) => p.status === "adopted").length,
    draft: pets.filter((p) => p.status === "draft").length,
  };

  // Quick Status Change Handler
  const handleStatusChange = (slug: string, newStatus: PetStatus) => {
    startTransition(async () => {
      const result = await updatePetStatus(slug, newStatus);
      if (result.success) {
        setPets((prev) =>
          prev.map((p) => (p.id === slug ? { ...p, status: newStatus } : p))
        );
        showToast(`Updated status to "${newStatus}".`);
      } else {
        alert(result.error || "Failed to update status.");
      }
    });
  };

  // Delete Handler with friendly confirmation
  const handleDelete = (pet: AdminPetItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${pet.name} (${pet.adoptionCode})?\n\nThis will remove them from the public website.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deletePet(pet.id);
      if (result.success) {
        setPets((prev) => prev.filter((p) => p.id !== pet.id));
        showToast(`${pet.name} has been removed.`);
      } else {
        alert(result.error || "Failed to remove companion.");
      }
    });
  };

  // Open "Mark as Adopted" Modal
  const openAdoptModal = (pet: AdminPetItem) => {
    setAdoptingPet(pet);
    setAdoptionModalState({
      adopterNames: "",
      neighborhood: "Bangalore",
      adoptedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      afterQuote: "",
      error: null,
      isSubmitting: false,
    });
  };

  // Submit Adoption Record
  const handleAdoptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adoptingPet) return;

    if (!adoptionModalState.adopterNames.trim()) {
      setAdoptionModalState((prev) => ({ ...prev, error: "Please enter the adopter's name." }));
      return;
    }
    if (!adoptionModalState.afterQuote.trim()) {
      setAdoptionModalState((prev) => ({
        ...prev,
        error: "Please write a short quote or update from the adopter.",
      }));
      return;
    }

    setAdoptionModalState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    const formData = new FormData();
    formData.set("slug", adoptingPet.id);
    formData.set("adopterNames", adoptionModalState.adopterNames);
    formData.set("neighborhood", adoptionModalState.neighborhood);
    formData.set("adoptedDate", adoptionModalState.adoptedDate);
    formData.set("afterQuote", adoptionModalState.afterQuote);

    const result = await markPetAsAdopted(null, formData);

    if (result.success) {
      setPets((prev) =>
        prev.map((p) => (p.id === adoptingPet.id ? { ...p, status: "adopted" } : p))
      );
      showToast(result.message || `${adoptingPet.name} is now marked as Adopted! 🎉`);
      setAdoptingPet(null);
    } else {
      setAdoptionModalState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: result.error || "Could not complete adoption record.",
      }));
    }
  };

  return (
    <div className="admin-pet-manager">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast-banner" role="status">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* Directory Top Bar */}
      <div className="admin-directory-header">
        <div>
          <span className="admin-welcome-eyebrow">Inventory &amp; Listings</span>
          <h1 className="admin-welcome-title">Rescue Companions</h1>
          <p className="admin-welcome-desc">
            Manage public pet profiles, update adoption availability, and celebrate forever homes.
          </p>
        </div>

        <Link href="/admin/pets/new" className="btn-admin-action primary btn-add-pet-cta">
          <span>➕</span> Add New Rescue Companion
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, code (#D01), or breed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="admin-status-tabs" role="tablist">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Pets <span className="tab-badge">{tabCounts.all}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "available" ? "active" : ""}`}
            onClick={() => setActiveTab("available")}
          >
            Ready for Adoption <span className="tab-badge green">{tabCounts.available}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            In Progress <span className="tab-badge yellow">{tabCounts.pending}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "adopted" ? "active" : ""}`}
            onClick={() => setActiveTab("adopted")}
          >
            Adopted 🎉 <span className="tab-badge purple">{tabCounts.adopted}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "draft" ? "active" : ""}`}
            onClick={() => setActiveTab("draft")}
          >
            Drafts &amp; Hidden <span className="tab-badge gray">{tabCounts.draft}</span>
          </button>
        </div>
      </div>

      {/* Pet Listings Grid / Empty State */}
      {filteredPets.length === 0 ? (
        <div className="admin-empty-catalog">
          <span className="admin-empty-icon">🐾</span>
          <h3 className="admin-empty-heading">No companions found</h3>
          <p className="admin-empty-sub">
            {searchQuery
              ? `No pets match "${searchQuery}". Try searching for another name or clearing the search.`
              : "No companions in this category yet."}
          </p>
          {searchQuery ? (
            <button
              type="button"
              className="btn-admin-action secondary"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>
          ) : (
            <Link href="/admin/pets/new" className="btn-admin-action primary">
              ➕ Add First Companion
            </Link>
          )}
        </div>
      ) : (
        <div className="admin-pets-grid">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="admin-pet-manage-card">
              {/* Pet Card Image & Badge */}
              <div className="manage-card-media">
                <img src={pet.image} alt={pet.name} className="manage-card-img" />
                <span
                  className={`manage-card-status status-${pet.status}`}
                >
                  {pet.status === "available" && "🟢 Ready for Adoption"}
                  {pet.status === "pending" && "🟡 In Progress"}
                  {pet.status === "adopted" && "🎉 Adopted!"}
                  {pet.status === "draft" && "⚪ Draft / Hidden"}
                  {pet.status === "archived" && "📦 Archived"}
                </span>
                <span className="manage-card-code">{pet.adoptionCode}</span>
              </div>

              {/* Pet Info */}
              <div className="manage-card-body">
                <div className="manage-card-header">
                  <h3 className="manage-pet-name">{pet.name}</h3>
                  <span className="manage-pet-species">
                    {pet.species === "dog" ? "🐶 Dog" : pet.species === "cat" ? "🐱 Cat" : "🐾 Other"}
                  </span>
                </div>

                <p className="manage-pet-details">
                  <strong>{pet.breed}</strong> • {pet.age} • {pet.gender}
                </p>

                <p className="manage-pet-location">
                  📍 {pet.location}
                </p>

                {/* Quick Personality Tags Preview */}
                {pet.tags && pet.tags.length > 0 && (
                  <div className="manage-pet-tags">
                    {pet.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="manage-tag-pill">
                        {tag}
                      </span>
                    ))}
                    {pet.tags.length > 3 && (
                      <span className="manage-tag-more">+{pet.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="manage-card-actions">
                <div className="action-row-main">
                  <Link
                    href={`/admin/pets/${pet.id}/edit`}
                    className="btn-manage-action edit"
                    title="Edit companion details"
                  >
                    ✏️ Edit Profile
                  </Link>

                  {pet.status !== "adopted" ? (
                    <button
                      type="button"
                      className="btn-manage-action adopt"
                      onClick={() => openAdoptModal(pet)}
                      title="Celebrate adoption and publish success story"
                    >
                      ✨ Mark Adopted
                    </button>
                  ) : (
                    <Link
                      href="/success-stories"
                      target="_blank"
                      className="btn-manage-action adopted-view"
                    >
                      🏆 View Story ↗
                    </Link>
                  )}
                </div>

                <div className="action-row-secondary">
                  {/* Status Dropdown */}
                  <div className="status-dropdown-wrap">
                    <label htmlFor={`status-${pet.id}`} className="sr-only">
                      Change status for {pet.name}
                    </label>
                    <select
                      id={`status-${pet.id}`}
                      className="admin-select-status"
                      value={pet.status}
                      disabled={isPending}
                      onChange={(e) => handleStatusChange(pet.id, e.target.value as PetStatus)}
                    >
                      <option value="available">🟢 Ready for Adoption</option>
                      <option value="pending">🟡 In Progress</option>
                      <option value="adopted">🎉 Adopted</option>
                      <option value="draft">⚪ Draft (Hidden)</option>
                      <option value="archived">📦 Archive</option>
                    </select>
                  </div>

                  {/* Public Link */}
                  <Link
                    href={`/adopt/${pet.id}`}
                    target="_blank"
                    className="btn-icon-preview"
                    title="View public profile on live website"
                  >
                    👁️
                  </Link>

                  {/* Delete Button */}
                  <button
                    type="button"
                    className="btn-icon-delete"
                    onClick={() => handleDelete(pet)}
                    disabled={isPending}
                    title="Delete companion"
                    aria-label={`Delete ${pet.name}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adoption Celebration Modal */}
      {adoptingPet && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="modal-header-celebrate">
              <span className="celebrate-emoji">🎉</span>
              <h2 className="modal-title">Celebrate Forever Home!</h2>
              <p className="modal-subtitle">
                Marking <strong>{adoptingPet.name} ({adoptingPet.adoptionCode})</strong> as adopted.
                This will celebrate their story on the public <strong>Success Stories</strong> page!
              </p>
            </div>

            {adoptionModalState.error && (
              <div className="admin-error-banner" role="alert">
                ⚠️ {adoptionModalState.error}
              </div>
            )}

            <form onSubmit={handleAdoptSubmit} className="adopt-celebrate-form">
              <div className="form-group">
                <label className="form-label" htmlFor="adopterNames">
                  Adopter Name(s) <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  id="adopterNames"
                  className="form-input"
                  placeholder="e.g. Ananya &amp; Rohit Sharma"
                  value={adoptionModalState.adopterNames}
                  onChange={(e) =>
                    setAdoptionModalState((prev) => ({ ...prev, adopterNames: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="neighborhood">
                    Bangalore Neighborhood <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="neighborhood"
                    className="form-input"
                    placeholder="e.g. Indiranagar, Bangalore"
                    value={adoptionModalState.neighborhood}
                    onChange={(e) =>
                      setAdoptionModalState((prev) => ({ ...prev, neighborhood: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adoptedDate">
                    Adoption Date
                  </label>
                  <input
                    type="text"
                    id="adoptedDate"
                    className="form-input"
                    placeholder="e.g. November 2026"
                    value={adoptionModalState.adoptedDate}
                    onChange={(e) =>
                      setAdoptionModalState((prev) => ({ ...prev, adoptedDate: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="afterQuote">
                  Happy Adopter Quote / Story <span className="req-star">*</span>
                </label>
                <textarea
                  id="afterQuote"
                  rows={3}
                  className="form-textarea"
                  placeholder="e.g. Within two days he claimed the sunny rug next to my desk! Watching him play is the best part of our day."
                  value={adoptionModalState.afterQuote}
                  onChange={(e) =>
                    setAdoptionModalState((prev) => ({ ...prev, afterQuote: e.target.value }))
                  }
                  required
                />
                <span className="form-field-hint">
                  This quote will be published on your public Success Stories page.
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setAdoptingPet(null)}
                  disabled={adoptionModalState.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-confirm"
                  disabled={adoptionModalState.isSubmitting}
                >
                  {adoptionModalState.isSubmitting ? (
                    "Publishing..."
                  ) : (
                    "🎉 Publish Success Story & Mark Adopted"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
