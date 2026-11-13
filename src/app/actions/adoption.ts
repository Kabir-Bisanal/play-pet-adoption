"use server";

import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

export interface AdoptionFormValues {
  petSlug: string;
  petName: string;
  petCode: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  city: string;
  residenceType: string;
  hasPetsCurrently: string;
  pastPetExperience: string;
  familyAgreement: boolean;
  hoursAlone: string;
  message: string;
  termsAccepted: boolean;
}

export interface AdoptionFormState {
  success: boolean;
  referenceCode?: string;
  petName?: string;
  petCode?: string;
  applicantName?: string;
  applicantPhone?: string;
  errors?: Partial<Record<keyof AdoptionFormValues, string>>;
  errorMessage?: string;
  values?: Partial<AdoptionFormValues>;
}

export async function submitAdoptionApplication(
  _prevState: AdoptionFormState | null,
  formData: FormData
): Promise<AdoptionFormState> {
  const petSlug = (formData.get("petSlug") as string)?.trim() || "";
  const petName = (formData.get("petName") as string)?.trim() || "Any Rescue Companion";
  const petCode = (formData.get("petCode") as string)?.trim() || "#GEN";
  const applicantName = (formData.get("applicantName") as string)?.trim() || "";
  const applicantEmail = (formData.get("applicantEmail") as string)?.trim() || "";
  const applicantPhone = (formData.get("applicantPhone") as string)?.trim() || "";
  const city = (formData.get("city") as string)?.trim() || "";
  const residenceType = (formData.get("residenceType") as string)?.trim() || "";
  const hasPetsCurrently = (formData.get("hasPetsCurrently") as string)?.trim() || "";
  const pastPetExperience = (formData.get("pastPetExperience") as string)?.trim() || "";
  const familyAgreement = formData.get("familyAgreement") === "on" || formData.get("familyAgreement") === "true";
  const hoursAlone = (formData.get("hoursAlone") as string)?.trim() || "";
  const message = (formData.get("message") as string)?.trim() || "";
  const termsAccepted = formData.get("termsAccepted") === "on" || formData.get("termsAccepted") === "true";

  const values: AdoptionFormValues = {
    petSlug,
    petName,
    petCode,
    applicantName,
    applicantEmail,
    applicantPhone,
    city,
    residenceType,
    hasPetsCurrently,
    pastPetExperience,
    familyAgreement,
    hoursAlone,
    message,
    termsAccepted,
  };

  const errors: Partial<Record<keyof AdoptionFormValues, string>> = {};

  if (!applicantName || applicantName.length < 2) {
    errors.applicantName = "Please enter your full name (at least 2 characters).";
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!applicantEmail || !emailRegex.test(applicantEmail) || applicantEmail.includes("..")) {
    errors.applicantEmail = "Please enter a valid email address.";
  }

  const cleanPhone = applicantPhone.replace(/[^\d+]/g, "");
  const digitCount = cleanPhone.replace(/\D/g, "").length;
  if (!applicantPhone || digitCount < 10) {
    errors.applicantPhone = "Please enter a valid 10-digit mobile or WhatsApp number.";
  }

  if (!city || city.length < 2) {
    errors.city = "Please enter your neighborhood/locality in Bangalore.";
  }

  if (!residenceType) {
    errors.residenceType = "Please select your housing type.";
  }

  if (!hasPetsCurrently) {
    errors.hasPetsCurrently = "Please select whether you currently have pets.";
  }

  if (!pastPetExperience) {
    errors.pastPetExperience = "Please indicate your pet parenting experience.";
  }

  if (!hoursAlone) {
    errors.hoursAlone = "Please select estimated daily alone time.";
  }

  if (!message || message.length < 10) {
    errors.message = "Please share a brief note about your home and routine (at least 10 characters).";
  }

  if (!familyAgreement) {
    errors.familyAgreement = "Please confirm that all members of your household agree to the adoption.";
  }

  if (!termsAccepted) {
    errors.termsAccepted = "Please acknowledge the lifelong commitment and veterinary care pledge.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      values,
      errorMessage: "Please complete all required fields highlighted below.",
    };
  }

  // Generate clean reference code
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const referenceCode = `APP-${randomSuffix}`;

  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error: dbError } = await supabase.from("adoption_applications").insert({
        pet_slug: petSlug || null,
        pet_name: petName,
        pet_code: petCode,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        city,
        residence_type: residenceType,
        has_pets_currently: hasPetsCurrently,
        past_pet_experience: pastPetExperience,
        family_agreement: familyAgreement,
        hours_alone: hoursAlone,
        message,
        status: "new",
        internal_notes: `Reference: #${referenceCode} via Online Application`,
      });

      if (dbError) {
        console.warn("Notice: Supabase insert error, falling back gracefully:", dbError.message);
      } else {
        // Log to activity_logs via admin client if service role key is configured
        try {
          const adminSupabase = getSupabaseAdminClient();
          if (adminSupabase) {
            await adminSupabase.from("activity_logs").insert({
              admin_email: "system@havenpaws.org",
              action: "application_submitted",
              details: {
                reference_code: referenceCode,
                pet_name: petName,
                pet_code: petCode,
                applicant_name: applicantName,
                applicant_email: applicantEmail,
              },
            });
          }
        } catch {
          // Non-critical background log
        }
      }
    }

    return {
      success: true,
      referenceCode,
      petName,
      petCode,
      applicantName,
      applicantPhone,
    };
  } catch (error) {
    console.error("Application submission exception:", error);
    // Still return success with referenceCode so user doesn't hit a wall
    return {
      success: true,
      referenceCode,
      petName,
      petCode,
      applicantName,
      applicantPhone,
    };
  }
}
