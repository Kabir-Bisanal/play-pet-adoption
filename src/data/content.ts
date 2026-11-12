export interface ProcessStep {
  step: string;
  title: string;
  summary: string;
  detail: string;
}

export interface WhyAdoptItem {
  icon: string;
  title: string;
  description: string;
}

export interface SuccessStory {
  id: string;
  petName: string;
  speciesLabel: string;
  adopterNames: string;
  neighborhood: string;
  adoptedDate: string;
  image: string;
  beforeNote: string;
  afterQuote: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const ADOPTION_PROCESS_STEPS: ProcessStep[] = [
  {
    step: "01",
    title: "Application Submission",
    summary: "Tell us who caught your eye and share a bit about your home.",
    detail:
      "Submit a quick enquiry on WhatsApp or fill out our adoption application with your living setup, daily schedule, and previous pet experience.",
  },
  {
    step: "02",
    title: "Application Review",
    summary: "Our caretakers review your lifestyle match within 24 hours.",
    detail:
      "We look at each animal's energy, social comfort, and age to make sure your household and routine are a genuinely good fit for them.",
  },
  {
    step: "03",
    title: "Intro Call & Home Assessment",
    summary: "A friendly chat and a quick safety check of your space.",
    detail:
      "We hop on a short call to answer your questions and do a simple balcony/gate safety check (in person or on video) so your home is pet-ready.",
  },
  {
    step: "04",
    title: "Meet & Greet Visit",
    summary: "Come spend relaxed, unhurried time together on our lawns.",
    detail:
      "Visit our North Bangalore facility near Rajanukunte. Walk, play, and bond with your chosen puppy or cat—no rushing.",
  },
  {
    step: "05",
    title: "Adoption Approval",
    summary: "Both your family and our care team confirm the match.",
    detail:
      "Once everyone—including any existing family pets or kids—feels comfortable after the meet-and-greet, we finalize the adoption date.",
  },
  {
    step: "06",
    title: "Adoption Agreement",
    summary: "Simple commitment to lifelong care and timely sterilisation.",
    detail:
      "You sign our straightforward adoption pledge covering vaccination follow-ups, spaying/neutering at 6 months, and keeping us updated if life changes.",
  },
  {
    step: "07",
    title: "Pet Handover & Support",
    summary: "Bring your new companion home with full medical records.",
    detail:
      "You receive their vaccination booklet, deworming log, and diet notes—plus direct WhatsApp support from our handlers whenever you need advice.",
  },
];

export const WHY_ADOPT_ITEMS: WhyAdoptItem[] = [
  {
    icon: "🏡",
    title: "Give a Real Rescue a Second Chance",
    description:
      "Every adoption opens up space, food, and medical care for another vulnerable puppy or kitten waiting on the streets.",
  },
  {
    icon: "🌿",
    title: "Built for Indian Climates",
    description:
      "Indie dogs and local domestic cats have strong natural immunity, fewer hereditary issues, and adapt effortlessly to local weather.",
  },
  {
    icon: "💛",
    title: "Honest Temperament Insights",
    description:
      "Our caretakers interact with every animal daily on open lawns, so we tell you their real habits—cuddly, shy, energetic, or calm.",
  },
  {
    icon: "🩺",
    title: "Vet-Checked & Guided Transition",
    description:
      "All rescues are dewormed, started on age-appropriate vaccinations, and backed by post-adoption guidance from our handlers.",
  },
];

export const SAMPLE_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "bruno-story",
    petName: "Biscuit (now Bruno)",
    speciesLabel: "Indie Dog",
    adopterNames: "Ananya & Rohan",
    neighborhood: "Yelahanka, Bangalore",
    adoptedDate: "October 2026",
    image: "/images/1.jpeg",
    beforeNote: "Found huddled near a construction site at 6 weeks old.",
    afterQuote:
      "He still pokes his tongue out every time he naps on our sofa after his evening walk. The care team helped us settle him in during his very first week.",
  },
  {
    id: "peanut-story",
    petName: "Peanut",
    speciesLabel: "Indie Mix",
    adopterNames: "Karthik Nair",
    neighborhood: "Indiranagar, Bangalore",
    adoptedDate: "September 2026",
    image: "/images/5.jpeg",
    beforeNote: "Shy tri-color pup who warmed up over lawn playtime.",
    afterQuote:
      "We were nervous as first-time dog parents, but getting honest advice about crate training and feeding schedules made the whole transition effortless.",
  },
  {
    id: "mochi-story",
    petName: "Mochi",
    speciesLabel: "Ginger Tabby Cat",
    adopterNames: "Meera Deshmukh",
    neighborhood: "Hebbal, Bangalore",
    adoptedDate: "August 2026",
    image: "/images/6.jpeg",
    beforeNote: "Rescued near Devanahalli and litter-trained indoors.",
    afterQuote:
      "Within two days she claimed the sunny spot right next to my desk window. Watching her purr through work calls is easily the best part of my day.",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is there an adoption fee?",
    answer:
      "We do not sell animals. We welcome a modest voluntary medical contribution toward vaccinations and deworming if you wish to support other rescues, though finding a safe, loving home always comes first.",
  },
  {
    question: "Can I adopt if I live in a rented apartment?",
    answer:
      "Yes! Many of our dogs and cats thrive in apartments. We simply ask that your landlord or society allows pets and that balconies/windows are safely netted for cats and small pups.",
  },
  {
    question: "Are the puppies and kittens already vaccinated and dewormed?",
    answer:
      "Yes. All animals are dewormed on schedule and started on age-appropriate core vaccinations before handover. You will receive their physical medical card to continue booster shots with your local vet.",
  },
  {
    question: "Why is spaying or neutering part of the adoption agreement?",
    answer:
      "Sterilisation at the right age (usually around 6 months) prevents unplanned litters, reduces wandering and territorial stress, and protects your pet from serious reproductive health issues later in life.",
  },
  {
    question: "Can families with young kids or other pets adopt?",
    answer:
      "Definitely. Each pet profile notes their comfort level with children, dogs, and cats. We also encourage bringing family members along to the meet-and-greet near Rajanukunte.",
  },
  {
    question: "Do you allow adoptions outside Bangalore?",
    answer:
      "Because we prefer in-person meet-and-greets and stay closely available for post-adoption support, we primarily place animals with families in and around Bangalore.",
  },
  {
    question: "What if an unexpected life situation means I can no longer keep my pet?",
    answer:
      "Never abandon or rehome them to strangers. Under our adoption pledge, you must contact us first—we will always take the animal back safely or help find them a verified new family.",
  },
  {
    question: "Can I visit the facility to meet the pets before deciding?",
    answer:
      "Yes! Just message us on WhatsApp to book a slot so one of our handlers can walk you through the open lawns and introduce you to the dogs and cats.",
  },
];
