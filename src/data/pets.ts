export type PetSpecies = "dog" | "cat";

export interface PetProfile {
  id: string;
  adoptionCode: string;
  name: string;
  species: PetSpecies;
  badgeLabel: string;
  breed: string;
  age: string;
  gender: "Male" | "Female";
  color: string;
  image: string;
  alt: string;
  tags: string[];
  vaccinationStatus: string;
  dewormedStatus: string;
  sterilisationStatus: string;
  location: string;
  story: string;
  whatsappMessage: string;
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
    color: "Golden Fawn",
    image: "/images/1.jpeg",
    alt: "Kaju - Golden puppy with tongue out",
    tags: ["Lap Cuddler", "Great with Kids", "Dewormed"],
    vaccinationStatus: "1st DP Shot scheduled",
    dewormedStatus: "Completed 2 cycles",
    sterilisationStatus: "Scheduled at 6 months",
    location: "Rajanukunte, North Bangalore",
    story:
      "Kaju is an affectionate, golden-fawn sweetheart who loves lap snuggles. He has a habit of poking his little tongue out when relaxed and gets along wonderfully with kids and other pets.",
    whatsappMessage:
      "Hi Haven Paws team, I fell in love with Kaju (#D01, the golden puppy) on your adoption website! Can we schedule a visit to meet him?",
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
    color: "Light Cream",
    image: "/images/2.jpeg",
    alt: "Daisy - Cream puppy",
    tags: ["Gentle Soul", "Apartment Friendly", "Quiet"],
    vaccinationStatus: "1st DP Shot scheduled",
    dewormedStatus: "Completed 2 cycles",
    sterilisationStatus: "Scheduled at 6 months",
    location: "Rajanukunte, North Bangalore",
    story:
      "Daisy is the gentle observer of her litter. With her soulful eyes and calm demeanor, she is perfect for an apartment home or a first-time dog parent who wants a calm cuddle buddy.",
    whatsappMessage:
      "Hi Haven Paws team, I'm interested in adopting Daisy (#D02, the cream puppy). Would love to know the adoption steps!",
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
    color: "Jet Black",
    image: "/images/3.jpeg",
    alt: "Simba - Black puppy with tongue out",
    tags: ["Playful Goof", "Garden Explorer", "Loves Dogs"],
    vaccinationStatus: "1st DP Shot scheduled",
    dewormedStatus: "Completed 2 cycles",
    sterilisationStatus: "Scheduled at 6 months",
    location: "Rajanukunte, North Bangalore",
    story:
      "Simba is a burst of puppy joy! He loves investigating the garden with his little mud-kissed nose, playing with toys, and greeting everyone with happy tail wags.",
    whatsappMessage:
      "Hi Haven Paws team, I saw Simba (#D03, black puppy with tongue out) on your website. Is he still available for adoption?",
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
    color: "Black & White Chest",
    image: "/images/4.jpeg",
    alt: "Shadow - Black puppy prancing",
    tags: ["Confident", "Quick Learner", "Active Family"],
    vaccinationStatus: "1st DP Shot scheduled",
    dewormedStatus: "Completed 2 cycles",
    sterilisationStatus: "Scheduled at 6 months",
    location: "Rajanukunte, North Bangalore",
    story:
      "Shadow carries himself with high confidence and curiosity. With his curved tail and tiny white chest badge, he's eager to explore and learn new puppy tricks.",
    whatsappMessage:
      "Hi Haven Paws team, I'd love to know more about Shadow (#D04, black puppy with curved tail). Can we speak on a call?",
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
    color: "Tri-Color",
    image: "/images/5.jpeg",
    alt: "Milo - Tri-color puppy",
    tags: ["White Tail Tip", "Inquisitive", "Loyal Friend"],
    vaccinationStatus: "1st DP Shot scheduled",
    dewormedStatus: "Completed 2 cycles",
    sterilisationStatus: "Scheduled at 6 months",
    location: "Rajanukunte, North Bangalore",
    story:
      "Milo has stunning tri-color markings and a special white paintbrush tip on his tail! He is inquisitive, highly responsive to people, and loves playing with soft chew toys.",
    whatsappMessage:
      "Hi Haven Paws team, I fell in love with Milo (#D05, the tri-color puppy with the white tail tip)! Is he open for adoption?",
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
    color: "Ginger & White Tabby",
    image: "/images/6.jpeg",
    alt: "Amber - Ginger and white kitten",
    tags: ["Litter Trained", "Snuggle Bug", "Gentle & Affectionate"],
    vaccinationStatus: "Up to date with feline core shots",
    dewormedStatus: "Completed",
    sterilisationStatus: "Scheduled at 6 months",
    location: "Devanahalli, North Bangalore",
    story:
      "Amber is a gentle ginger tabby kitten who loves snuggles and chin rubs. She is 100% litter trained, comfortable around people, and loves watching the clouds from the window.",
    whatsappMessage:
      "Hi Haven Paws team, I saw Amber (#C01, the 4-5 month ginger kitten in Devanahalli) on your adoption website. I would love to adopt her!",
  },
];
