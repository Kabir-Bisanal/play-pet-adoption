"use client";

import { useState, useActionState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPet, updatePet, PetActionResult } from "@/app/actions/pet-management";
import { PetProfile } from "@/data/pets";
import { PetStatus, PetSpecies } from "@/lib/supabase/types";

interface AdminPetFormProps {
  mode: "create" | "edit";
  initialData?: PetProfile & { status?: PetStatus };
}

const COMMON_TAGS = [
  "Lap Cuddler",
  "Great with Kids",
  "Loves Toys",
  "House Trained",
  "Calm Walker",
  "Playful Pup",
  "Cat Friendly",
  "Dog Friendly",
  "Dewormed",
  "Vaccinated",
  "Gentle Soul",
];

const STARTER_PHOTOS = [
  { url: "/images/1.jpeg", label: "Golden Puppy" },
  { url: "/images/2.jpeg", label: "Sleeping Pup" },
  { url: "/images/3.jpeg", label: "Calm Retriever" },
  { url: "/images/4.jpeg", label: "Playful Indie" },
  { url: "/images/5.jpeg", label: "Adult Indie" },
  { url: "/images/6.jpeg", label: "Curious Cat" },
  { url: "/images/7.jpeg", label: "Ginger Tabby" },
];

export default function AdminPetForm({ mode, initialData }: AdminPetFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [species, setSpecies] = useState<PetSpecies>(initialData?.species || "dog");
  const [gender, setGender] = useState<"Male" | "Female">(initialData?.gender || "Male");
  const [status, setStatus] = useState<PetStatus>(initialData?.status || "available");
  const [size, setSize] = useState(initialData?.size || "Medium");

  // Photos state
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image || null);
  const [starterPhoto, setStarterPhoto] = useState<string>(initialData?.image || "/images/1.jpeg");

  // Personality Tags
  const [tags, setTags] = useState<string[]>(initialData?.tags || ["Lap Cuddler", "Great with Kids"]);
  const [customTagInput, setCustomTagInput] = useState("");

  // Health toggles
  const [vaccinationStatus, setVaccinationStatus] = useState(initialData?.vaccinationStatus || "Vaccinated");
  const [dewormedStatus, setDewormedStatus] = useState(initialData?.dewormedStatus || "Dewormed");
  const [sterilisationStatus, setSterilisationStatus] = useState(
    initialData?.sterilisationStatus || "Scheduled / Completed"
  );
  const [isSpecialNeeds, setIsSpecialNeeds] = useState(initialData?.isSpecialNeeds || false);
  const [isSenior, setIsSenior] = useState(initialData?.isSenior || false);

  // Server action dispatch
  const formActionFn = mode === "create" ? createPet : updatePet;
  const [state, formAction, isPending] = useActionState<PetActionResult, FormData>(
    async (prevState, formData) => {
      // Inject tags
      formData.set("tags", tags.join(","));
      formData.set("species", species);
      formData.set("gender", gender);
      formData.set("size", size);
      formData.set("status", status);
      formData.set("starterPhoto", starterPhoto);
      formData.set("vaccinationStatus", vaccinationStatus);
      formData.set("dewormedStatus", dewormedStatus);
      formData.set("sterilisationStatus", sterilisationStatus);
      formData.set("isSpecialNeeds", isSpecialNeeds ? "true" : "false");
      formData.set("isSenior", isSenior ? "true" : "false");

      if (mode === "edit" && initialData?.id) {
        formData.set("slug", initialData.id);
      }

      const res = await formActionFn(prevState, formData);
      if (res.success) {
        setTimeout(() => {
          router.push("/admin/pets");
        }, 1200);
      }
      return res;
    },
    { success: false }
  );

  // Toggle tag helper
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  // Add custom tag
  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const clean = customTagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setCustomTagInput("");
    }
  };

  // File change preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setStarterPhoto(""); // Reset starter photo choice
    }
  };

  // Quick choose starter photo
  const handleChooseStarterPhoto = (url: string) => {
    setStarterPhoto(url);
    setPreviewUrl(url);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="admin-pet-form-container">
      {/* Breadcrumb Header */}
      <div className="admin-form-top">
        <Link href="/admin/pets" className="admin-back-btn">
          ← Back to Pet Directory
        </Link>
        <span className="admin-welcome-eyebrow">
          {mode === "create" ? "New Arrival" : "Edit Companion"}
        </span>
        <h1 className="admin-welcome-title">
          {mode === "create" ? "Add Rescue Companion" : `Editing ${initialData?.name || "Pet"}`}
        </h1>
        <p className="admin-welcome-desc">
          Fill out the details below. Slugs and companion reference codes are assigned automatically.
        </p>
      </div>

      {/* Success Notification */}
      {state.success && (
        <div className="admin-success-banner" role="status">
          <span className="success-icon" aria-hidden="true">
            🎉
          </span>
          <div>
            <strong>Success!</strong> {state.message || "Companion profile saved successfully!"}
            <span className="success-sub">Redirecting you to the pet directory...</span>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {state.error && (
        <div className="admin-error-banner" role="alert">
          <span aria-hidden="true">⚠️</span> {state.error}
        </div>
      )}

      <form action={formAction} className="admin-pet-form" noValidate>
        {/* Section 1: Basic Profile */}
        <section className="admin-form-section">
          <div className="section-header">
            <span className="section-number">1</span>
            <div>
              <h2 className="section-title">Who is this sweet soul?</h2>
              <p className="section-desc">Basic identification details for prospective adopters.</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Companion Name <span className="req-star">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={initialData?.name || ""}
              placeholder="e.g. Rocky, Cleo, Simba"
              className="form-input"
              required
            />
            <span className="form-field-hint">The name that appears on the public website and in WhatsApp inquiries.</span>
          </div>

          {/* Species Picker */}
          <div className="form-group">
            <label className="form-label">Species <span className="req-star">*</span></label>
            <div className="species-pills-row" role="radiogroup">
              <button
                type="button"
                className={`species-pill-btn ${species === "dog" ? "active" : ""}`}
                onClick={() => setSpecies("dog")}
              >
                <span>🐶</span> Dog / Puppy
              </button>
              <button
                type="button"
                className={`species-pill-btn ${species === "cat" ? "active" : ""}`}
                onClick={() => setSpecies("cat")}
              >
                <span>🐱</span> Cat / Kitten
              </button>
              <button
                type="button"
                className={`species-pill-btn ${species === "other" ? "active" : ""}`}
                onClick={() => setSpecies("other")}
              >
                <span>🐾</span> Other Animal
              </button>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="breed" className="form-label">
                Breed / Mix <span className="req-star">*</span>
              </label>
              <input
                type="text"
                id="breed"
                name="breed"
                defaultValue={initialData?.breed || ""}
                placeholder="e.g. Indie Mix, Calico, Labrador"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age" className="form-label">
                Approximate Age <span className="req-star">*</span>
              </label>
              <input
                type="text"
                id="age"
                name="age"
                defaultValue={initialData?.age || ""}
                placeholder="e.g. 2 Months, 1.5 Years, 4 Years"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row-3">
            {/* Gender */}
            <div className="form-group">
              <label className="form-label">Gender <span className="req-star">*</span></label>
              <div className="gender-toggle-row">
                <button
                  type="button"
                  className={`gender-btn ${gender === "Male" ? "active" : ""}`}
                  onClick={() => setGender("Male")}
                >
                  ♂️ Male
                </button>
                <button
                  type="button"
                  className={`gender-btn ${gender === "Female" ? "active" : ""}`}
                  onClick={() => setGender("Female")}
                >
                  ♀️ Female
                </button>
              </div>
            </div>

            {/* Size */}
            <div className="form-group">
              <label htmlFor="size" className="form-label">
                Size
              </label>
              <select
                id="size"
                className="form-select"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                <option value="Small (Expected Medium)">Small (&lt; 10 kg)</option>
                <option value="Medium">Medium (10–25 kg)</option>
                <option value="Large">Large (25+ kg)</option>
              </select>
            </div>

            {/* Color */}
            <div className="form-group">
              <label htmlFor="color" className="form-label">
                Coat Color
              </label>
              <input
                type="text"
                id="color"
                name="color"
                defaultValue={initialData?.color || ""}
                placeholder="e.g. Golden Fawn, Black &amp; White"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Shelter Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={initialData?.location || "North Bangalore (Rajanukunte)"}
              className="form-input"
            />
          </div>
        </section>

        {/* Section 2: Photos */}
        <section className="admin-form-section">
          <div className="section-header">
            <span className="section-number">2</span>
            <div>
              <h2 className="section-title">Companion Photos</h2>
              <p className="section-desc">
                Take a photo with your mobile camera or pick from your phone library.
              </p>
            </div>
          </div>

          <div className="photo-upload-container">
            {/* Live Preview Card */}
            {previewUrl && (
              <div className="photo-preview-box">
                <img src={previewUrl} alt="Pet Preview" className="photo-preview-img" />
                <span className="photo-preview-tag">Active Primary Photo</span>
              </div>
            )}

            {/* File Upload Zone */}
            <div className="photo-dropzone">
              <input
                ref={fileInputRef}
                type="file"
                id="photoFile"
                name="photoFile"
                accept="image/*"
                capture="environment"
                className="photo-file-hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="photoFile" className="btn-camera-upload">
                <span className="camera-icon">📸</span>
                <strong>Take Photo or Upload from Phone</strong>
                <span className="camera-sub">JPG, PNG, WebP up to 10MB</span>
              </label>
            </div>
          </div>

          {/* Starter Photos Selector */}
          <div className="starter-photos-block">
            <span className="starter-label">
              Or pick one of our starter rescue photos:
            </span>
            <div className="starter-thumbs-grid">
              {STARTER_PHOTOS.map((starter) => (
                <button
                  key={starter.url}
                  type="button"
                  className={`starter-thumb-btn ${
                    starterPhoto === starter.url ? "selected" : ""
                  }`}
                  onClick={() => handleChooseStarterPhoto(starter.url)}
                  title={starter.label}
                >
                  <img src={starter.url} alt={starter.label} />
                  {starterPhoto === starter.url && <span className="check-badge">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Story & Personality */}
        <section className="admin-form-section">
          <div className="section-header">
            <span className="section-number">3</span>
            <div>
              <h2 className="section-title">Story &amp; Personality</h2>
              <p className="section-desc">
                Help adopters fall in love with their rescue backstory and quirks.
              </p>
            </div>
          </div>

          {/* Personality Tag Chips */}
          <div className="form-group">
            <label className="form-label">
              Personality Traits (Tap to add/remove)
            </label>
            <div className="tags-chip-cloud">
              {COMMON_TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-chip-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="custom-tag-row">
              <input
                type="text"
                className="form-input custom-tag-input"
                placeholder="Type a custom trait (e.g. Loves Car Rides)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
              />
              <button
                type="button"
                className="btn-add-custom-tag"
                onClick={handleAddCustomTag}
              >
                + Add Trait
              </button>
            </div>
          </div>

          {/* Story Textarea */}
          <div className="form-group">
            <label htmlFor="story" className="form-label">
              Rescue Story &amp; Personality Details <span className="req-star">*</span>
            </label>
            <textarea
              id="story"
              name="story"
              rows={5}
              defaultValue={initialData?.story || ""}
              placeholder="e.g. Found wandering near Yelahanka lake, this sweet girl was shivering and shy. Within days at Haven Paws, she transformed into an affectionate cuddler who loves resting her chin on your knee. She is gentle around other dogs and loves warm sunny spots."
              className="form-textarea"
              required
            />
            <span className="form-field-hint">
              Be authentic and descriptive. Mention what kind of home would be their dream match.
            </span>
          </div>
        </section>

        {/* Section 4: Health & Medical */}
        <section className="admin-form-section">
          <div className="section-header">
            <span className="section-number">4</span>
            <div>
              <h2 className="section-title">Health &amp; Medical Status</h2>
              <p className="section-desc">
                Transparent health notes build trust with potential adopters.
              </p>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="vaccinationStatus" className="form-label">
                Vaccination Status
              </label>
              <input
                type="text"
                id="vaccinationStatus"
                className="form-input"
                value={vaccinationStatus}
                onChange={(e) => setVaccinationStatus(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dewormedStatus" className="form-label">
                Deworming Status
              </label>
              <input
                type="text"
                id="dewormedStatus"
                className="form-input"
                value={dewormedStatus}
                onChange={(e) => setDewormedStatus(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sterilisationStatus" className="form-label">
                Sterilisation Status
              </label>
              <input
                type="text"
                id="sterilisationStatus"
                className="form-input"
                value={sterilisationStatus}
                onChange={(e) => setSterilisationStatus(e.target.value)}
              />
            </div>
          </div>

          <div className="special-toggles-grid">
            <label className="checkbox-toggle-card">
              <input
                type="checkbox"
                checked={isSpecialNeeds}
                onChange={(e) => setIsSpecialNeeds(e.target.checked)}
              />
              <div>
                <strong>❤️ Special Needs Companion</strong>
                <span>Three-legged, visually impaired, deaf, or on special diet</span>
              </div>
            </label>

            <label className="checkbox-toggle-card">
              <input
                type="checkbox"
                checked={isSenior}
                onChange={(e) => setIsSenior(e.target.checked)}
              />
              <div>
                <strong>👵 Senior Companion</strong>
                <span>7+ years old, ready for calm golden years</span>
              </div>
            </label>
          </div>
        </section>

        {/* Section 5: Listing Status */}
        <section className="admin-form-section">
          <div className="section-header">
            <span className="section-number">5</span>
            <div>
              <h2 className="section-title">Listing Visibility</h2>
              <p className="section-desc">
                Control whether this companion is visible to the public or saved as an internal draft.
              </p>
            </div>
          </div>

          <div className="status-options-grid" role="radiogroup" aria-label="Listing Visibility">
            <button
              type="button"
              role="radio"
              aria-checked={status === "available"}
              className={`status-option-card ${status === "available" ? "selected" : ""}`}
              onClick={() => setStatus("available")}
            >
              <span className="status-icon" aria-hidden="true">🟢</span>
              <div className="status-option-text">
                <strong className="status-option-title">Ready for Adoption</strong>
                <span className="status-option-desc">Visible immediately in the public catalog</span>
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={status === "pending"}
              className={`status-option-card ${status === "pending" ? "selected" : ""}`}
              onClick={() => setStatus("pending")}
            >
              <span className="status-icon" aria-hidden="true">🟡</span>
              <div className="status-option-text">
                <strong className="status-option-title">Adoption in Progress</strong>
                <span className="status-option-desc">Application is approved or undergoing meet-and-greet</span>
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={status === "draft"}
              className={`status-option-card ${status === "draft" ? "selected" : ""}`}
              onClick={() => setStatus("draft")}
            >
              <span className="status-icon" aria-hidden="true">⚪</span>
              <div className="status-option-text">
                <strong className="status-option-title">Save as Draft</strong>
                <span className="status-option-desc">Hidden from public until staff completes intake</span>
              </div>
            </button>
          </div>
        </section>

        {/* Mobile Sticky / Desktop Action Bar */}
        <div className="admin-form-sticky-actions">
          <div className="container form-actions-inner">
            <Link href="/admin/pets" className="btn-form-cancel">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-admin-submit-save"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="spinner-dot" aria-hidden="true" />
                  Saving Companion Profile...
                </>
              ) : (
                <>
                  <span>💾</span> {mode === "create" ? "Add to Rescue Directory" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
