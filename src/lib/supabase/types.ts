export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PetSpecies = "dog" | "cat" | "other";
export type PetStatus = "available" | "pending" | "adopted" | "draft" | "archived";
export type ApplicationStatus =
  | "new"
  | "under_review"
  | "interview"
  | "meet_and_greet"
  | "approved"
  | "rejected"
  | "completed";

export interface Database {
  public: {
    Tables: {
      pets: {
        Row: {
          id: string;
          slug: string;
          adoption_code: string;
          name: string;
          species: PetSpecies;
          badge_label: string;
          breed: string;
          age: string;
          gender: "Male" | "Female";
          size: string | null;
          color: string | null;
          location: string;
          image: string;
          gallery: string[];
          alt: string | null;
          tags: string[];
          vaccination_status: string;
          dewormed_status: string;
          sterilisation_status: string;
          medical_history: string[];
          adoption_requirements: string[];
          story: string;
          whatsapp_message: string | null;
          is_special_needs: boolean;
          is_senior: boolean;
          status: PetStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          adoption_code: string;
          name: string;
          species: PetSpecies;
          badge_label?: string;
          breed: string;
          age: string;
          gender: "Male" | "Female";
          size?: string | null;
          color?: string | null;
          location?: string;
          image: string;
          gallery?: string[];
          alt?: string | null;
          tags?: string[];
          vaccination_status?: string;
          dewormed_status?: string;
          sterilisation_status?: string;
          medical_history?: string[];
          adoption_requirements?: string[];
          story: string;
          whatsapp_message?: string | null;
          is_special_needs?: boolean;
          is_senior?: boolean;
          status?: PetStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          adoption_code?: string;
          name?: string;
          species?: PetSpecies;
          badge_label?: string;
          breed?: string;
          age?: string;
          gender?: "Male" | "Female";
          size?: string | null;
          color?: string | null;
          location?: string;
          image?: string;
          gallery?: string[];
          alt?: string | null;
          tags?: string[];
          vaccination_status?: string;
          dewormed_status?: string;
          sterilisation_status?: string;
          medical_history?: string[];
          adoption_requirements?: string[];
          story?: string;
          whatsapp_message?: string | null;
          is_special_needs?: boolean;
          is_senior?: boolean;
          status?: PetStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pet_photos: {
        Row: {
          id: string;
          pet_slug: string;
          url: string;
          alt: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_slug: string;
          url: string;
          alt?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_slug?: string;
          url?: string;
          alt?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      adoption_applications: {
        Row: {
          id: string;
          pet_slug: string | null;
          pet_name: string;
          pet_code: string;
          applicant_name: string;
          applicant_email: string;
          applicant_phone: string;
          city: string;
          residence_type: string;
          has_pets_currently: string;
          past_pet_experience: string;
          family_agreement: boolean;
          hours_alone: string;
          message: string | null;
          status: ApplicationStatus;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_slug?: string | null;
          pet_name: string;
          pet_code: string;
          applicant_name: string;
          applicant_email: string;
          applicant_phone: string;
          city?: string;
          residence_type: string;
          has_pets_currently: string;
          past_pet_experience: string;
          family_agreement?: boolean;
          hours_alone: string;
          message?: string | null;
          status?: ApplicationStatus;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_slug?: string | null;
          pet_name?: string;
          pet_code?: string;
          applicant_name?: string;
          applicant_email?: string;
          applicant_phone?: string;
          city?: string;
          residence_type?: string;
          has_pets_currently?: string;
          past_pet_experience?: string;
          family_agreement?: boolean;
          hours_alone?: string;
          message?: string | null;
          status?: ApplicationStatus;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      adoption_records: {
        Row: {
          id: string;
          pet_slug: string | null;
          pet_name: string;
          species_label: string;
          adopter_names: string;
          neighborhood: string;
          adopted_date: string;
          image: string;
          before_note: string | null;
          after_quote: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_slug?: string | null;
          pet_name: string;
          species_label: string;
          adopter_names: string;
          neighborhood: string;
          adopted_date: string;
          image: string;
          before_note?: string | null;
          after_quote: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_slug?: string | null;
          pet_name?: string;
          species_label?: string;
          adopter_names?: string;
          neighborhood?: string;
          adopted_date?: string;
          image?: string;
          before_note?: string | null;
          after_quote?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          admin_email: string;
          action: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_email: string;
          action: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_email?: string;
          action?: string;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
