export type ApplicationStatus =
  | "new"
  | "under_review"
  | "interview"
  | "meet_and_greet"
  | "approved"
  | "rejected"
  | "completed";

export interface AdoptionApplicationRecord {
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
}

export const SAMPLE_APPLICATIONS: AdoptionApplicationRecord[] = [
  {
    id: "app-101",
    pet_slug: "kaju",
    pet_name: "Kaju",
    pet_code: "#D01",
    applicant_name: "Priya & Rohan Nair",
    applicant_email: "priya.nair.blr@gmail.com",
    applicant_phone: "+91 98450 21980",
    city: "Yelahanka, North Bangalore",
    residence_type: "Independent Villa with Fenced Lawn",
    has_pets_currently: "1 rescued senior Indie dog (neutered, gentle with puppies)",
    past_pet_experience: "Over 12 years raising rescue dogs in Bangalore. Experienced in crate routines and basic positive reinforcement.",
    family_agreement: true,
    hours_alone: "1-2 hours (hybrid work schedule, one parent home at all times)",
    message: "We visited Haven Paws last weekend and Kaju cuddled right in Rohan's arms. We're looking for a warm companion to grow alongside our senior dog Milo.",
    status: "new",
    internal_notes: "Initial intake looks exceptional. Secure compound wall verified in conversation.",
    created_at: "2026-11-13T06:15:00.000Z",
    updated_at: "2026-11-13T06:15:00.000Z",
  },
  {
    id: "app-102",
    pet_slug: "amber",
    pet_name: "Amber",
    pet_code: "#C01",
    applicant_name: "Dr. Arvind Swaminathan",
    applicant_email: "arvind.swamy@manipal.edu",
    applicant_phone: "+91 97412 88341",
    city: "Hebbal, North Bangalore",
    residence_type: "3BHK Apartment with Balcony Cat-Netting",
    has_pets_currently: "None currently; lost our senior Persian cat 8 months ago.",
    past_pet_experience: "Lifelong cat parent; very familiar with litter box maintenance, scratching posts, and routine vet checkups.",
    family_agreement: true,
    hours_alone: "3-4 hours on weekdays",
    message: "Looking for an affectionate indoor cat. Amber's calm description near the sunlit window fits our quiet apartment perfectly.",
    status: "under_review",
    internal_notes: "Balcony netting is installed and certified by Bengaluru Cat Care. Pending doctor's shift schedule check.",
    created_at: "2026-11-12T14:40:00.000Z",
    updated_at: "2026-11-12T16:20:00.000Z",
  },
  {
    id: "app-103",
    pet_slug: "simba",
    pet_name: "Simba",
    pet_code: "#D03",
    applicant_name: "Meera & Tanmay Deshmukh",
    applicant_email: "meera.deshmukh@techventures.io",
    applicant_phone: "+91 99001 54320",
    city: "Sahakara Nagar, Bangalore",
    residence_type: "Gated Community Row House",
    has_pets_currently: "No other pets",
    past_pet_experience: "Fostered 2 rescue puppies during 2024 through CUPA. Familiar with vet visits and puppy diet.",
    family_agreement: true,
    hours_alone: "2 hours maximum",
    message: "Tanmay and I work fully remote. We want a friendly dog who loves daily morning park walks and weekend hikes.",
    status: "interview",
    internal_notes: "Phone screening completed on Nov 12. Great energy. Scheduled shelter visit for meet-and-greet on Saturday 11 AM.",
    created_at: "2026-11-11T09:10:00.000Z",
    updated_at: "2026-11-12T11:00:00.000Z",
  },
  {
    id: "app-104",
    pet_slug: "shadow",
    pet_name: "Shadow",
    pet_code: "#D04",
    applicant_name: "Karan Johar Sharma",
    applicant_email: "karan.sharma.blr@gmail.com",
    applicant_phone: "+91 98860 77123",
    city: "Jakkur, North Bangalore",
    residence_type: "Independent Duplex House",
    has_pets_currently: "None",
    past_pet_experience: "First-time primary dog adopter, but extended family has 2 Labradors.",
    family_agreement: true,
    hours_alone: "4-5 hours",
    message: "Shadow has that soulful gentle look. I live right next to Jakkur lake park and want to give a rescued puppy a forever home.",
    status: "meet_and_greet",
    internal_notes: "Meet-and-greet conducted at Rajanukunte shelter. Shadow was calm and responsive to Karan. Awaiting home safety video.",
    created_at: "2026-11-10T12:00:00.000Z",
    updated_at: "2026-11-12T17:30:00.000Z",
  },
  {
    id: "app-105",
    pet_slug: "daisy",
    pet_name: "Daisy",
    pet_code: "#D02",
    applicant_name: "Ananya & Siddharth Roy",
    applicant_email: "ananya.roy92@outlook.com",
    applicant_phone: "+91 98190 33411",
    city: "Kanakapura Road, Bangalore",
    residence_type: "Farmhouse / Permaculture Plot",
    has_pets_currently: "2 rescued Indie dogs and 3 farm ducks",
    past_pet_experience: "Over 15 years adopting Indies and working with local animal welfare volunteers.",
    family_agreement: true,
    hours_alone: "0 hours (family lives and runs eco-retreat on site)",
    message: "Daisy would have endless space to run and play with our other dogs under constant human supervision.",
    status: "approved",
    internal_notes: "Home visit completed by volunteer Deepak. Exceptional setup. Adoption paperwork and handover scheduled for Sunday.",
    created_at: "2026-11-08T08:00:00.000Z",
    updated_at: "2026-11-11T14:00:00.000Z",
  },
];
