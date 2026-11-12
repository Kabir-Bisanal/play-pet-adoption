export type PetSpecies = "dog" | "cat" | "other";

export interface PetProfile {
  id: string;
  adoptionCode: string;
  name: string;
  species: PetSpecies;
  badgeLabel: string;
  breed: string;
  age: string;
  gender: "Male" | "Female";
  size: string;
  color: string;
  image: string;
  gallery: string[];
  alt: string;
  tags: string[];
  vaccinationStatus: string;
  dewormedStatus: string;
  sterilisationStatus: string;
  medicalHistory: string[];
  adoptionRequirements: string[];
  location: string;
  story: string;
  whatsappMessage: string;
  isSpecialNeeds?: boolean;
  isSenior?: boolean;
}

export const SAMPLE_PETS: PetProfile[] = [
  {
    id: "kaju",
    adoptionCode: "#D01",
    name: "Kaju",
    species: "dog",
    badgeLabel: "Puppy",
    breed: "Indie Mix",
    age: "2 Months",
    gender: "Male",
    size: "Small (Expected Medium)",
    color: "Golden Fawn",
    image: "/images/1.jpeg",
    gallery: ["/images/1.jpeg", "/images/7.jpeg", "/images/2.jpeg"],
    alt: "Kaju - Golden puppy with tongue out",
    tags: ["Lap Cuddler", "Great with Kids", "Dewormed", "Puppy"],
    vaccinationStatus: "1st DP Shot scheduled",
    dewormedStatus: "Completed 2 cycles",
    sterilisationStatus: "Scheduled at 6 months",
    medicalHistory: [
      "Initial pediatric health check: clear lungs, alert reflexes, strong pulse",
      "Deworming cycles 1 and 2 completed at Dr. Paws Veterinary Clinic",
      "1st DP (Distemper + Parvo) vaccination scheduled at 8 weeks",
      "Preventative flea & tick treatment administered",
      "Weight tracking: 2.4 kg on high-protein puppy starter diet",
    ],
    adoptionRequirements: [
      "Committed family prepared for puppy house-training and gentle socialization",
      "Safe indoor living space with dedicated sleeping and play zones",
      "Mandatory completion of all 3 core puppy vaccinations",
      "Agreement for sterilisation at 6 months through our clinic partner",
      "Adoption contract and pre-adoption home safety review",
    ],
    location: "Rajanukunte, North Bangalore",
    story:
      "Kaju is an affectionate, golden-fawn sweetheart who loves lap snuggles. He has a habit of poking his little tongue out when relaxed and gets along wonderfully with kids and other pets.",
    whatsappMessage:
      "Hi Haven Paws team, I fell in love with Kaju (#D01, the golden puppy) on your adoption website! Can we schedule a visit to meet him?",
    isSpecialNeeds: false,
    isSenior: false,
  },
  {
    id: "daisy",
    adoptionCode: "#D02",
    name: "Daisy",
    species: "dog",
    badgeLabel: "Puppy",
    breed: "Indie Mix",
    age: "2 Months",
    gender: "Female",
    size: "Small (Expected Medium)",
    color: "Light Cream",
    image: "/images/2.jpeg",
    gallery: ["/images/2.jpeg", "/images/7.jpeg", "/images/1.jpeg"],
    alt: "Daisy - Cream puppy",
    tags: ["Gentle Soul", "Apartment Friendly", "Quiet", "Puppy"],
    vaccinationStatus: "1st DP Shot scheduled",
    dewormedStatus: "Completed 2 cycles",
    sterilisationStatus: "Scheduled at 6 months",
    medicalHistory: [
      "Comprehensive puppy checkup: normal temperature and hydration",
      "Deworming cycles 1 & 2 completed without complications",
      "Ear canals clean and mite-free; skin coat in great condition",
      "Scheduled for core DP shot at 8 weeks",
    ],
    adoptionRequirements: [
      "Calm, patient home environment ideal for an observant puppy",
      "Apartment or house with secured doors and windows",
      "Mandatory spaying pledge at 6 months",
      "Daily gentle walks and mental enrichment playtime",
    ],
    location: "Rajanukunte, North Bangalore",
    story:
      "Daisy is the gentle observer of her litter. With her soulful eyes and calm demeanor, she is perfect for an apartment home or a first-time dog parent who wants a calm cuddle buddy.",
    whatsappMessage:
      "Hi Haven Paws team, I'm interested in adopting Daisy (#D02, the cream puppy). Would love to know the adoption steps!",
    isSpecialNeeds: false,
    isSenior: false,
  },
  {
    id: "simba",
    adoptionCode: "#D03",
    name: "Simba",
    species: "dog",
    badgeLabel: "Puppy",
    breed: "Indie Mix",
    age: "2 Months",
    gender: "Male",
    size: "Small (Expected Medium)",
    color: "Jet Black",
    image: "/images/3.jpeg",
    gallery: ["/images/3.jpeg", "/images/7.jpeg", "/images/4.jpeg"],
    alt: "Simba - Black puppy with tongue out",
    tags: ["Playful Goof", "Garden Explorer", "Loves Dogs", "Puppy"],
    vaccinationStatus: "1st DP Shot scheduled",
    dewormedStatus: "Completed 2 cycles",
    sterilisationStatus: "Scheduled at 6 months",
    medicalHistory: [
      "Puppy vitality assessment: robust reflexes and active demeanor",
      "Deworming rounds 1 & 2 administered on schedule",
      "Core DP vaccination booked at partner veterinary hospital",
      "Diet transition to soaked puppy kibble successful",
    ],
    adoptionRequirements: [
      "Energetic household with time for interactive games and outdoor garden runs",
      "Pet-proofed indoor living space and fenced garden access",
      "Commitment to mandatory neutering at 6 months",
      "Completion of all puppy vaccination series",
    ],
    location: "Rajanukunte, North Bangalore",
    story:
      "Simba is a burst of puppy joy! He loves investigating the garden with his little mud-kissed nose, playing with toys, and greeting everyone with happy tail wags.",
    whatsappMessage:
      "Hi Haven Paws team, I saw Simba (#D03, black puppy with tongue out) on your website. Is he still available for adoption?",
    isSpecialNeeds: false,
    isSenior: false,
  },
  {
    id: "shadow",
    adoptionCode: "#D04",
    name: "Shadow",
    species: "dog",
    badgeLabel: "Puppy",
    breed: "Indie Mix",
    age: "2 Months",
    gender: "Male",
    size: "Small (Expected Medium)",
    color: "Black & White Chest",
    image: "/images/4.jpeg",
    gallery: ["/images/4.jpeg", "/images/7.jpeg", "/images/3.jpeg"],
    alt: "Shadow - Black puppy prancing",
    tags: ["Confident", "Quick Learner", "Active Family", "Puppy"],
    vaccinationStatus: "1st DP Shot scheduled",
    dewormedStatus: "Completed 2 cycles",
    sterilisationStatus: "Scheduled at 6 months",
    medicalHistory: [
      "Pediatric clinical screening: strong musculoskeletal structure",
      "Dewormed twice with broad-spectrum veterinary syrup",
      "First core vaccine scheduled at 8 weeks",
      "Microchipping registered for 6-month sterilisation milestone",
    ],
    adoptionRequirements: [
      "Active family excited to teach positive reinforcement commands",
      "Secure living quarters with safe outdoor exercise routine",
      "Mandatory neutering pledge at 6 months",
      "Follow-up photo check-ins during the first year",
    ],
    location: "Rajanukunte, North Bangalore",
    story:
      "Shadow carries himself with high confidence and curiosity. With his curved tail and tiny white chest badge, he's eager to explore and learn new puppy tricks.",
    whatsappMessage:
      "Hi Haven Paws team, I'd love to know more about Shadow (#D04, black puppy with curved tail). Can we speak on a call?",
    isSpecialNeeds: false,
    isSenior: false,
  },
  {
    id: "milo",
    adoptionCode: "#D05",
    name: "Milo",
    species: "dog",
    badgeLabel: "Puppy",
    breed: "Indie Mix",
    age: "2 Months",
    gender: "Male",
    size: "Small (Expected Medium)",
    color: "Tri-Color",
    image: "/images/5.jpeg",
    gallery: ["/images/5.jpeg", "/images/7.jpeg", "/images/1.jpeg"],
    alt: "Milo - Tri-color puppy",
    tags: ["White Tail Tip", "Inquisitive", "Loyal Friend", "Puppy"],
    vaccinationStatus: "1st DP Shot scheduled",
    dewormedStatus: "Completed 2 cycles",
    sterilisationStatus: "Scheduled at 6 months",
    medicalHistory: [
      "Physical examination: bright eyes, clear airways, and glossy coat",
      "Deworming completed across 2 scheduled cycles",
      "Core vaccinations slated for administration at 8 weeks",
      "Weight: 2.5 kg, thriving with steady daily gains",
    ],
    adoptionRequirements: [
      "Caring household ready to give lots of warmth and guidance",
      "Safe indoor environment with secured doors and stair gates",
      "Sterilisation agreement at 6 months",
      "Adoption paperwork and home check verification",
    ],
    location: "Rajanukunte, North Bangalore",
    story:
      "Milo has stunning tri-color markings and a special white paintbrush tip on his tail! He is inquisitive, highly responsive to people, and loves playing with soft chew toys.",
    whatsappMessage:
      "Hi Haven Paws team, I fell in love with Milo (#D05, the tri-color puppy with the white tail tip)! Is he open for adoption?",
    isSpecialNeeds: false,
    isSenior: false,
  },
  {
    id: "amber",
    adoptionCode: "#C01",
    name: "Amber",
    species: "cat",
    badgeLabel: "Kitten",
    breed: "Domestic Short Hair",
    age: "4–5 Months",
    gender: "Female",
    size: "Small",
    color: "Ginger & White Tabby",
    image: "/images/6.jpeg",
    gallery: ["/images/6.jpeg", "/images/2.jpeg", "/images/5.jpeg"],
    alt: "Amber - Ginger and white kitten",
    tags: ["Litter Trained", "Snuggle Bug", "Gentle & Affectionate", "Kitten"],
    vaccinationStatus: "Up to date with feline core shots",
    dewormedStatus: "Completed",
    sterilisationStatus: "Scheduled at 6 months",
    medicalHistory: [
      "Feline Tricat (FVRCP) core vaccination doses administered",
      "Deworming completed with clear fecal examination",
      "Ear mite check negative; claws trimmed and maintained",
      "Spaying appointment confirmed at 6 months with shelter partner hospital",
    ],
    adoptionRequirements: [
      "Strictly 100% indoor home with safety netting on all balconies & window grills",
      "Agreement to complete mandatory spaying at 6 months",
      "Annual feline wellness visits and rabies boosters",
      "Calm, loving environment with scratching posts and interactive toys",
    ],
    location: "Devanahalli, North Bangalore",
    story:
      "Amber is a gentle ginger tabby kitten who loves snuggles and chin rubs. She is 100% litter trained, comfortable around people, and loves watching the clouds from the window.",
    whatsappMessage:
      "Hi Haven Paws team, I saw Amber (#C01, the 4-5 month ginger kitten in Devanahalli) on your adoption website. I would love to adopt her!",
    isSpecialNeeds: false,
    isSenior: false,
  },
  {
    id: "rocky",
    adoptionCode: "#D06",
    name: "Rocky",
    species: "dog",
    badgeLabel: "Senior",
    breed: "Indie Mix",
    age: "8 Years",
    gender: "Male",
    size: "Medium",
    color: "Warm Tan & Black",
    image: "/images/3.jpeg",
    gallery: ["/images/3.jpeg", "/images/4.jpeg", "/images/7.jpeg"],
    alt: "Rocky - Gentle senior Indie dog with soulful eyes",
    tags: ["Senior", "Gentle Soul", "House Trained", "Leash Pro"],
    vaccinationStatus: "Fully vaccinated (DHPPiL + Anti-Rabies up to date)",
    dewormedStatus: "Completed annual cycle",
    sterilisationStatus: "Neutered",
    medicalHistory: [
      "Senior blood work panel: normal liver, kidney, and glucose levels",
      "Annual DHPPiL and Anti-Rabies booster vaccinations current",
      "Dental assessment: scale & polish completed with healthy gums",
      "Joint mobility: mild age-related stiffness managed with daily glucosamine",
      "Neutered, microchipped, and heartworm negative",
    ],
    adoptionRequirements: [
      "Peaceful retirement home without steep stairs or slippery tile flooring",
      "Padded orthopaedic dog bed in a cozy, draft-free room",
      "Leisurely 20-minute daily morning and evening walks",
      "Adopter seeking a gentle, calm, loyal companion with zero puppy hyper-activity",
    ],
    location: "Yelahanka, North Bangalore",
    story:
      "Rocky is a gentle 8-year-old soul who has mastered the art of being a loyal best friend. He is completely house-trained, walks politely on a leash without pulling, and loves nothing more than resting his chin on your knee while you work.",
    whatsappMessage:
      "Hi Haven Paws team, I am interested in offering a loving retirement home to Rocky (#D06, the senior Indie dog). Could we arrange a visit?",
    isSpecialNeeds: false,
    isSenior: true,
  },
  {
    id: "cleo",
    adoptionCode: "#C02",
    name: "Cleo",
    species: "cat",
    badgeLabel: "Special Needs",
    breed: "Domestic Short Hair",
    age: "2 Years",
    gender: "Female",
    size: "Small",
    color: "Calico",
    image: "/images/6.jpeg",
    gallery: ["/images/6.jpeg", "/images/1.jpeg", "/images/7.jpeg"],
    alt: "Cleo - Resilient three-legged calico cat",
    tags: ["Special Needs", "Tripod Champion", "Litter Trained", "Cuddle Enthusiast"],
    vaccinationStatus: "Fully vaccinated (FVRCP + Rabies)",
    dewormedStatus: "Completed",
    sterilisationStatus: "Spayed",
    medicalHistory: [
      "Rescued with severe hind leg fracture; underwent successful tripod orthopaedic surgery",
      "Surgical site fully healed; navigates furniture and rooms with excellent balance",
      "Feline Leukemia (FeLV) and FIV tested negative",
      "Core feline vaccinations and rabies booster current",
      "Spayed and microchipped",
    ],
    adoptionRequirements: [
      "Strictly 100% indoor home with non-slip carpets or rugs",
      "Window mesh and balcony netting mandatory",
      "Low-entry litter box for effortless access",
      "Adopter who understands and celebrates special-needs companions",
    ],
    location: "Sahakara Nagar, North Bangalore",
    story:
      "Cleo is a three-legged wonder who proves that love has no limits. After a successful recovery from an old injury, she dashes around with joy, climbs onto the sofa for cuddles, and purrs like a tiny motorboat whenever you enter the room.",
    whatsappMessage:
      "Hi Haven Paws team, I would love to adopt Cleo (#C02, the tripod special-needs calico cat). How can we take this forward?",
    isSpecialNeeds: true,
    isSenior: false,
  },
  {
    id: "oreo",
    adoptionCode: "#O01",
    name: "Oreo",
    species: "other",
    badgeLabel: "Rescued Rabbit",
    breed: "Dutch Mix Rabbit",
    age: "1 Year",
    gender: "Female",
    size: "Small",
    color: "Black & White",
    image: "/images/2.jpeg",
    gallery: ["/images/2.jpeg", "/images/5.jpeg", "/images/3.jpeg"],
    alt: "Oreo - Rescued black and white rabbit",
    tags: ["Gentle", "Litter Box Trained", "Quiet", "Vegetarian Foodie"],
    vaccinationStatus: "Exotic pet health check passed",
    dewormedStatus: "Completed small animal deworming",
    sterilisationStatus: "Spayed",
    medicalHistory: [
      "Exotic veterinary wellness exam: teeth and molars in perfect alignment",
      "Small-animal parasite screening negative",
      "Spayed by exotic animal veterinary specialist",
      "Thriving on Timothy hay, leafy greens, and fresh clean water",
    ],
    adoptionRequirements: [
      "Spacious indoor exercise pen or bunny-proofed room (cramped cages not permitted)",
      "Diet of 80% fresh timothy hay, clean water bowl, and daily fresh coriander/greens",
      "Gentle handling with adult supervision if children are present",
      "Access to an exotic / small-animal veterinary clinic for routine checkups",
    ],
    location: "Hebbal, North Bangalore",
    story:
      "Oreo is an inquisitive, gentle rabbit rescued from an overcrowded yard. She has learned to love head scratches, does happy little binkies during morning exercise time, and is reliably litter box trained.",
    whatsappMessage:
      "Hi Haven Paws team, I saw Oreo (#O01, the rescued bunny) on your adoption website. We have a rabbit-safe home and would love to meet her!",
    isSpecialNeeds: false,
    isSenior: false,
  },
];
