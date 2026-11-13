"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PetProfile } from "@/data/pets";
import { buildWhatsAppUrl, SITE_CONFIG } from "@/config/site";
import { submitAdoptionApplication, AdoptionFormState } from "@/app/actions/adoption";

interface AdoptionApplicationFormProps {
  pets: PetProfile[];
  initialPetSlug?: string;
}

const RESIDENCE_OPTIONS = [
  "Own Apartment",
  "Rented Apartment (Pet-Friendly)",
  "Independent House / Villa",
  "Gated Community / Farmhouse",
  "Other",
];

const CURRENT_PET_OPTIONS = [
  "No pets currently",
  "Yes — Dog(s)",
  "Yes — Cat(s)",
  "Yes — Both Dogs & Cats",
  "Yes — Small Animals / Birds",
];

const EXPERIENCE_OPTIONS = [
  "First-time pet parent (eager to learn!)",
  "Have had pets in the past",
  "Currently have pets at home",
  "Experienced rescue or special-needs caregiver",
];

const HOURS_ALONE_OPTIONS = [
  "Under 2 hours daily",
  "2 – 4 hours daily",
  "4 – 6 hours daily",
  "6+ hours daily",
  "Someone is always home (Work from Home / Family)",
];

export default function AdoptionApplicationForm({
  pets,
  initialPetSlug = "",
}: AdoptionApplicationFormProps) {
  const searchParams = useSearchParams();
  const queryPet = searchParams ? (searchParams.get("pet") || searchParams.get("id") || "") : "";

  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialPetSlug || queryPet
  );

  useEffect(() => {
    if (!searchParams) return;
    const q = searchParams.get("pet") || searchParams.get("id");
    if (q) {
      setSelectedSlug(q.toLowerCase().trim());
    }
  }, [searchParams]);

  const [state, formAction, isPending] = useActionState<AdoptionFormState, FormData>(
    submitAdoptionApplication,
    { success: false }
  );

  const selectedPet = pets.find((p) => p.id === selectedSlug);

  if (state.success) {
    const waText = `Hi Haven Paws team, I just submitted an online adoption application (#${state.referenceCode}) for ${state.petName || "a companion"}! My name is ${state.applicantName || "Adopter"}. Looking forward to our consultation!`;
    const waUrl = buildWhatsAppUrl(waText);

    return (
      <div className="application-success-card" role="status" aria-live="polite">
        <div className="success-icon-badge" aria-hidden="true">
          🐾
        </div>
        <span className="success-badge-pill">Application Received</span>
        <h2 className="success-title">Thank You, {state.applicantName || "Friend"}!</h2>
        <p className="success-subtitle">
          Your adoption application for <strong>{state.petName}</strong> (
          {state.petCode}) has been received and logged in our system.
        </p>

        <div className="success-ref-box">
          <span className="ref-label">Application Reference Code</span>
          <span className="ref-code">#{state.referenceCode}</span>
          <span className="ref-note">Keep this code handy for quick WhatsApp follow-up</span>
        </div>

        <div className="success-next-steps">
          <h4 className="next-steps-title">What Happens Next?</h4>
          <ol className="next-steps-list">
            <li>
              <strong>1. Review (Within 24 Hours):</strong> Our Bangalore care team reviews your home environment and lifestyle fit.
            </li>
            <li>
              <strong>2. WhatsApp Intro Call:</strong> We reach out to answer your questions and do a friendly home safety chat.
            </li>
            <li>
              <strong>3. Play Lawn Meet &amp; Greet:</strong> Visit our Rajanukunte lawns to bond with {state.petName} in person!
            </li>
          </ol>
        </div>

        <div className="success-actions">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-success-wa"
          >
            <span>💬</span> Follow Up on WhatsApp (Ref #{state.referenceCode})
          </a>
          <Link href="/adopt" className="btn-success-browse">
            ← Browse Other Companions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="adoption-form" noValidate>
      {/* Hidden inputs to sync selected pet data */}
      <input
        type="hidden"
        name="petSlug"
        value={selectedPet ? selectedPet.id : selectedSlug}
      />
      <input
        type="hidden"
        name="petName"
        value={selectedPet ? selectedPet.name : "General / Help Me Choose"}
      />
      <input
        type="hidden"
        name="petCode"
        value={selectedPet ? selectedPet.adoptionCode : "#GEN"}
      />

      {state.errorMessage && (
        <div className="form-global-error" role="alert">
          <span aria-hidden="true">⚠️</span> {state.errorMessage}
        </div>
      )}

      {/* SECTION 1: SELECTED COMPANION */}
      <fieldset className="form-section">
        <legend className="form-section-title">
          <span className="section-step">1</span> Selected Companion
        </legend>
        <p className="form-section-desc">
          Tell us which rescue pet caught your eye, or choose general consideration.
        </p>

        <div className="form-group">
          <label htmlFor="petSelect" className="form-label">
            Pet you wish to adopt <span className="req-star">*</span>
          </label>
          <select
            id="petSelect"
            className="form-select"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
          >
            <option value="">🐾 General Application (Help Me Choose a Pet)</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.adoptionCode}) — {p.breed} • {p.age}
              </option>
            ))}
          </select>
        </div>

        {selectedPet && (
          <div className="selected-pet-preview">
            <img
              src={selectedPet.image}
              alt={selectedPet.alt || selectedPet.name}
              className="selected-pet-thumb"
            />
            <div className="selected-pet-info">
              <span className="selected-pet-badge">{selectedPet.badgeLabel}</span>
              <h4 className="selected-pet-name">
                {selectedPet.name}{" "}
                <span className="selected-pet-code">({selectedPet.adoptionCode})</span>
              </h4>
              <p className="selected-pet-meta">
                {selectedPet.breed} • {selectedPet.gender} • {selectedPet.age} •{" "}
                {selectedPet.location}
              </p>
            </div>
          </div>
        )}
      </fieldset>

      {/* SECTION 2: APPLICANT CONTACT DETAILS */}
      <fieldset className="form-section">
        <legend className="form-section-title">
          <span className="section-step">2</span> Your Contact Information
        </legend>
        <p className="form-section-desc">
          We use this to contact you within 24 hours for your consultation.
        </p>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="applicantName" className="form-label">
              Full Name <span className="req-star">*</span>
            </label>
            <input
              type="text"
              id="applicantName"
              name="applicantName"
              defaultValue={state.values?.applicantName || ""}
              placeholder="e.g. Kabir Bisanal"
              className={`form-input ${state.errors?.applicantName ? "input-error" : ""}`}
              aria-describedby={state.errors?.applicantName ? "err-name" : undefined}
              required
            />
            {state.errors?.applicantName && (
              <span id="err-name" className="field-error-msg">
                {state.errors.applicantName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="applicantEmail" className="form-label">
              Email Address <span className="req-star">*</span>
            </label>
            <input
              type="email"
              id="applicantEmail"
              name="applicantEmail"
              defaultValue={state.values?.applicantEmail || ""}
              placeholder="e.g. kabir@example.com"
              className={`form-input ${state.errors?.applicantEmail ? "input-error" : ""}`}
              aria-describedby={state.errors?.applicantEmail ? "err-email" : undefined}
              required
            />
            {state.errors?.applicantEmail && (
              <span id="err-email" className="field-error-msg">
                {state.errors.applicantEmail}
              </span>
            )}
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="applicantPhone" className="form-label">
              WhatsApp / Phone Number <span className="req-star">*</span>
            </label>
            <input
              type="tel"
              id="applicantPhone"
              name="applicantPhone"
              defaultValue={state.values?.applicantPhone || ""}
              placeholder="e.g. +91 98765 43210"
              className={`form-input ${state.errors?.applicantPhone ? "input-error" : ""}`}
              aria-describedby={state.errors?.applicantPhone ? "err-phone" : undefined}
              required
            />
            {state.errors?.applicantPhone && (
              <span id="err-phone" className="field-error-msg">
                {state.errors.applicantPhone}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="city" className="form-label">
              Neighborhood &amp; City <span className="req-star">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              defaultValue={state.values?.city || "Bangalore"}
              placeholder="e.g. Yelahanka, Bangalore"
              className={`form-input ${state.errors?.city ? "input-error" : ""}`}
              aria-describedby={state.errors?.city ? "err-city" : undefined}
              required
            />
            {state.errors?.city && (
              <span id="err-city" className="field-error-msg">
                {state.errors.city}
              </span>
            )}
          </div>
        </div>
      </fieldset>

      {/* SECTION 3: HOME & LIFESTYLE */}
      <fieldset className="form-section">
        <legend className="form-section-title">
          <span className="section-step">3</span> Home &amp; Daily Life
        </legend>
        <p className="form-section-desc">
          Helps our caretakers ensure the pet will thrive in your environment.
        </p>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="residenceType" className="form-label">
              Housing Type <span className="req-star">*</span>
            </label>
            <select
              id="residenceType"
              name="residenceType"
              defaultValue={state.values?.residenceType || ""}
              className={`form-select ${state.errors?.residenceType ? "input-error" : ""}`}
              required
            >
              <option value="">Select your home setup...</option>
              {RESIDENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {state.errors?.residenceType && (
              <span className="field-error-msg">{state.errors.residenceType}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="hasPetsCurrently" className="form-label">
              Current Pets in Home <span className="req-star">*</span>
            </label>
            <select
              id="hasPetsCurrently"
              name="hasPetsCurrently"
              defaultValue={state.values?.hasPetsCurrently || ""}
              className={`form-select ${state.errors?.hasPetsCurrently ? "input-error" : ""}`}
              required
            >
              <option value="">Select current pets...</option>
              {CURRENT_PET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {state.errors?.hasPetsCurrently && (
              <span className="field-error-msg">{state.errors.hasPetsCurrently}</span>
            )}
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="pastPetExperience" className="form-label">
              Pet Parenting Experience <span className="req-star">*</span>
            </label>
            <select
              id="pastPetExperience"
              name="pastPetExperience"
              defaultValue={state.values?.pastPetExperience || ""}
              className={`form-select ${state.errors?.pastPetExperience ? "input-error" : ""}`}
              required
            >
              <option value="">Select your experience level...</option>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {state.errors?.pastPetExperience && (
              <span className="field-error-msg">{state.errors.pastPetExperience}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="hoursAlone" className="form-label">
              Expected Time Pet Stays Alone Daily <span className="req-star">*</span>
            </label>
            <select
              id="hoursAlone"
              name="hoursAlone"
              defaultValue={state.values?.hoursAlone || ""}
              className={`form-select ${state.errors?.hoursAlone ? "input-error" : ""}`}
              required
            >
              <option value="">Select typical alone time...</option>
              {HOURS_ALONE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {state.errors?.hoursAlone && (
              <span className="field-error-msg">{state.errors.hoursAlone}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Tell Us About Your Household &amp; Routine <span className="req-star">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            defaultValue={state.values?.message || ""}
            placeholder="Share a bit about your work schedule, why you chose this companion, where they will sleep, and any questions you have for our team..."
            className={`form-textarea ${state.errors?.message ? "input-error" : ""}`}
            required
          />
          {state.errors?.message && (
            <span className="field-error-msg">{state.errors.message}</span>
          )}
        </div>
      </fieldset>

      {/* SECTION 4: COMMITMENTS & PLEDGE */}
      <fieldset className="form-section">
        <legend className="form-section-title">
          <span className="section-step">4</span> Family Agreement &amp; Pledge
        </legend>

        <div className="form-checkbox-card">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="familyAgreement"
              defaultChecked={state.values?.familyAgreement || false}
              className="form-checkbox"
              required
            />
            <span className="checkbox-text">
              <strong>Household Consensus:</strong> Everyone in my household
              (family members, flatmates, and landlord if renting) is fully aware,
              supportive, and excited to welcome a rescue pet.
            </span>
          </label>
          {state.errors?.familyAgreement && (
            <span className="field-error-msg">{state.errors.familyAgreement}</span>
          )}
        </div>

        <div className="form-checkbox-card">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="termsAccepted"
              defaultChecked={state.values?.termsAccepted || false}
              className="form-checkbox"
              required
            />
            <span className="checkbox-text">
              <strong>Lifelong Commitment &amp; Care Pledge:</strong> I understand
              adoption is a 10–15 year lifelong commitment. I agree to provide
              regular veterinary care, complete required vaccinations, and adhere
              to timely spaying/neutering at 6 months of age.
            </span>
          </label>
          {state.errors?.termsAccepted && (
            <span className="field-error-msg">{state.errors.termsAccepted}</span>
          )}
        </div>
      </fieldset>

      {/* SUBMISSION BUTTONS */}
      <div className="form-submit-row">
        <button
          type="submit"
          className="btn-submit-application"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="spinner-dot" aria-hidden="true" />
              Submitting Application...
            </>
          ) : (
            <>
              <span>🐾</span> Submit Adoption Application
            </>
          )}
        </button>

        <p className="form-submit-note">
          Prefer WhatsApp instead?{" "}
          <a
            href={buildWhatsAppUrl("Hi Haven Paws team, I would like to inquire about adopting a companion.")}
            target="_blank"
            rel="noopener noreferrer"
            className="form-wa-alt"
          >
            Chat with a Coordinator directly →
          </a>
        </p>
      </div>
    </form>
  );
}
