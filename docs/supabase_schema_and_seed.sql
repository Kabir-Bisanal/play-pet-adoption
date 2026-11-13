-- ==============================================================================
-- Haven Paws Adoption Platform — Supabase Production Database Schema & Seed
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if needed for clean re-run (Order respects foreign keys)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS adoption_applications CASCADE;
DROP TABLE IF EXISTS pet_photos CASCADE;
DROP TABLE IF EXISTS adoption_records CASCADE;
DROP TABLE IF EXISTS pets CASCADE;

-- ==============================================================================
-- 3. PETS TABLE
-- ==============================================================================
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    adoption_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'other')),
    badge_label TEXT NOT NULL DEFAULT 'Available',
    breed TEXT NOT NULL,
    age TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    size TEXT,
    color TEXT,
    location TEXT NOT NULL DEFAULT 'North Bangalore (Rajanukunte)',
    image TEXT NOT NULL,
    gallery TEXT[] NOT NULL DEFAULT '{}',
    alt TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    vaccination_status TEXT NOT NULL DEFAULT 'Vaccinated',
    dewormed_status TEXT NOT NULL DEFAULT 'Dewormed',
    sterilisation_status TEXT NOT NULL DEFAULT 'Scheduled / Completed',
    medical_history TEXT[] NOT NULL DEFAULT '{}',
    adoption_requirements TEXT[] NOT NULL DEFAULT '{}',
    story TEXT NOT NULL,
    whatsapp_message TEXT,
    is_special_needs BOOLEAN NOT NULL DEFAULT false,
    is_senior BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'adopted', 'draft', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy catalog queries and slug routing
CREATE INDEX idx_pets_slug ON pets(slug);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_status ON pets(status);
CREATE INDEX idx_pets_adoption_code ON pets(adoption_code);

-- ==============================================================================
-- 4. PET PHOTOS TABLE (Gallery Management)
-- ==============================================================================
CREATE TABLE pet_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_slug TEXT NOT NULL REFERENCES pets(slug) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_pet_photos_pet_slug ON pet_photos(pet_slug);

-- ==============================================================================
-- 5. ADOPTION APPLICATIONS TABLE (12-Field Online Adoption Pipeline)
-- ==============================================================================
CREATE TABLE adoption_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_slug TEXT REFERENCES pets(slug) ON DELETE SET NULL,
    pet_name TEXT NOT NULL,
    pet_code TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Bangalore',
    residence_type TEXT NOT NULL, -- 'Own Apartment', 'Rented Apartment', 'Independent House', etc.
    has_pets_currently TEXT NOT NULL, -- 'Yes - Dogs', 'Yes - Cats', 'None currently', etc.
    past_pet_experience TEXT NOT NULL,
    family_agreement BOOLEAN NOT NULL DEFAULT true,
    hours_alone TEXT NOT NULL, -- '0-2 hours', '2-4 hours', '4-6 hours', '6+ hours'
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'interview', 'meet_and_greet', 'approved', 'rejected', 'completed')),
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_applications_status ON adoption_applications(status);
CREATE INDEX idx_applications_created_at ON adoption_applications(created_at DESC);

-- ==============================================================================
-- 6. ADOPTION RECORDS TABLE (Success Stories & Archive)
-- ==============================================================================
CREATE TABLE adoption_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_slug TEXT,
    pet_name TEXT NOT NULL,
    species_label TEXT NOT NULL,
    adopter_names TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    adopted_date TEXT NOT NULL,
    image TEXT NOT NULL,
    before_note TEXT,
    after_quote TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. ACTIVITY LOGS TABLE (Single Admin Action History)
-- ==============================================================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- PETS: Public can view active pets; logged-in Admin has full control
CREATE POLICY "Public can view active pets" ON pets
    FOR SELECT USING (status IN ('available', 'pending', 'adopted'));

CREATE POLICY "Admin full access to pets" ON pets
    FOR ALL USING (auth.role() = 'authenticated');

-- PET PHOTOS: Public can view; Admin has full control
CREATE POLICY "Public can view pet photos" ON pet_photos
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to pet photos" ON pet_photos
    FOR ALL USING (auth.role() = 'authenticated');

-- APPLICATIONS: Anyone can submit an adoption application; only Admin can view/edit
CREATE POLICY "Public can submit adoption application" ON adoption_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full access to applications" ON adoption_applications
    FOR ALL USING (auth.role() = 'authenticated');

-- ADOPTION RECORDS: Public can view success stories; Admin has full control
CREATE POLICY "Public can view adoption records" ON adoption_records
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to adoption records" ON adoption_records
    FOR ALL USING (auth.role() = 'authenticated');

-- ACTIVITY LOGS: Admin only
CREATE POLICY "Admin full access to activity logs" ON activity_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET: pet-images
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public can view images; authenticated Admin can upload/delete
CREATE POLICY "Public can view pet images" ON storage.objects
    FOR SELECT USING (bucket_id = 'pet-images');

CREATE POLICY "Admin can upload pet images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'pet-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can update pet images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'pet-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can delete pet images" ON storage.objects
    FOR DELETE USING (bucket_id = 'pet-images' AND auth.role() = 'authenticated');

-- ==============================================================================
-- 10. SEED INITIAL PET DATA (9 Verified Companions)
-- ==============================================================================
INSERT INTO pets (
    slug, adoption_code, name, species, badge_label, breed, age, gender, size, color,
    location, image, gallery, alt, tags, vaccination_status, dewormed_status, sterilisation_status,
    medical_history, adoption_requirements, story, whatsapp_message, is_special_needs, is_senior, status
) VALUES 
(
    'kaju',
    '#D01',
    'Kaju',
    'dog',
    'Puppy',
    'Indie Mix',
    '2 Months',
    'Male',
    'Small (Expected Medium)',
    'Golden Fawn',
    'Rajanukunte, North Bangalore',
    '/images/1.jpeg',
    ARRAY['/images/1.jpeg', '/images/7.jpeg', '/images/2.jpeg'],
    'Kaju - Golden puppy with tongue out',
    ARRAY['Lap Cuddler', 'Great with Kids', 'Dewormed', 'Puppy'],
    '1st DP Shot scheduled',
    'Completed 2 cycles',
    'Scheduled at 6 months',
    ARRAY[
        'Initial pediatric health check: clear lungs, alert reflexes, strong pulse',
        'Deworming cycles 1 and 2 completed at Dr. Paws Veterinary Clinic',
        '1st DP (Distemper + Parvo) vaccination scheduled at 8 weeks',
        'Preventative flea & tick treatment administered',
        'Weight tracking: 2.4 kg on high-protein puppy starter diet'
    ],
    ARRAY[
        'Committed family prepared for puppy house-training and gentle socialization',
        'Safe indoor living space with dedicated sleeping and play zones',
        'Mandatory completion of all 3 core puppy vaccinations',
        'Agreement for sterilisation at 6 months through our clinic partner',
        'Adoption contract and pre-adoption home safety review'
    ],
    'Kaju is an affectionate, golden-fawn sweetheart who loves lap snuggles. He has a habit of poking his little tongue out when relaxed and gets along wonderfully with kids and other pets.',
    'Hi Haven Paws team, I fell in love with Kaju (#D01, the golden puppy) on your adoption website! Can we schedule a visit to meet him?',
    false,
    false,
    'available'
),
(
    'daisy',
    '#D02',
    'Daisy',
    'dog',
    'Puppy',
    'Indie Mix',
    '2 Months',
    'Female',
    'Small (Expected Medium)',
    'Fawn Brown',
    'Rajanukunte, North Bangalore',
    '/images/7.jpeg',
    ARRAY['/images/7.jpeg', '/images/1.jpeg', '/images/3.jpeg'],
    'Daisy - Gentle brown puppy',
    ARRAY['Curious Explorer', 'Gentle Nature', 'First Vaccine Done', 'Puppy'],
    '1st DP Completed',
    'Completed 2 cycles',
    'Scheduled at 6 months',
    ARRAY[
        'Comprehensive newborn pediatric examination: no heart murmur, clean eyes and ears',
        '1st DP (Distemper + Parvovirus) administered on October 24, 2026',
        'Preventative Broad-Spectrum deworming liquid administered twice',
        'Topical tick and flea preventative applied',
        'Healthy gut flora with consistent appetite and 2.6 kg weight'
    ],
    ARRAY[
        'Indoor household with secure doors and balconies',
        'Time commitment for daily playtime, potty training, and early leash training',
        'Completion of booster 7-in-1 vaccination at 12 weeks',
        'Sterilisation pledge at 6 months of age',
        'Willingness to stay in touch with our adoption welfare coordinator'
    ],
    'Daisy is a thoughtful, observant little girl who loves gentle affection. She is calm, curious about birds in the garden, and bonds deeply with anyone who speaks softly to her.',
    'Hi Haven Paws team, I saw Daisy (#D02) on the website and would love to know more about adopting her!',
    false,
    false,
    'available'
),
(
    'simba',
    '#D03',
    'Simba',
    'dog',
    'Puppy',
    'Indie Mix',
    '2.5 Months',
    'Male',
    'Small (Expected Medium)',
    'Warm Tan',
    'Rajanukunte, North Bangalore',
    '/images/2.jpeg',
    ARRAY['/images/2.jpeg', '/images/1.jpeg', '/images/4.jpeg'],
    'Simba - Playful indie puppy looking attentive',
    ARRAY['High Energy', 'Food Motivated', 'Dewormed', 'Puppy'],
    '1st DHPPi Done',
    'Completed 2 cycles',
    'Scheduled at 6 months',
    ARRAY[
        'Full physical exam upon shelter intake: excellent bone structure and bright disposition',
        'DHPPi core vaccination administered on October 28, 2026',
        'Deworming with oral suspension at 4 weeks and 7 weeks',
        'Clean skin scrape, negative for mites and skin allergens',
        'Current weight: 3.1 kg, energetic and thriving on puppy kibble'
    ],
    ARRAY[
        'Active family or individual who enjoys outdoor walks and puppy playtime',
        'Firm indoor-only pet home policy with fenced outdoor areas',
        'Adherence to puppy vaccination protocol (Rabies and boosters at 16 weeks)',
        'Mandatory sterilisation contract at 6 months',
        'Signed adoption pledge with Haven Paws'
    ],
    'Simba has the brave heart of a tiny lion! He bounds across our open lawns chasing leaves and is always the first to greet our morning caretakers with enthusiastic tail wags.',
    'Hi Haven Paws team, Simba (#D03) looks so playful and adorable! Can I meet him this weekend?',
    false,
    false,
    'available'
),
(
    'shadow',
    '#D04',
    'Shadow',
    'dog',
    'Puppy',
    'Indie Mix',
    '2 Months',
    'Male',
    'Small (Expected Medium)',
    'Midnight Black',
    'Rajanukunte, North Bangalore',
    '/images/3.jpeg',
    ARRAY['/images/3.jpeg', '/images/2.jpeg', '/images/7.jpeg'],
    'Shadow - Sleek black puppy with soulful eyes',
    ARRAY['Calm & Gentle', 'Loyal Companion', 'Dewormed', 'Puppy'],
    '1st DP Scheduled',
    'Completed 2 cycles',
    'Scheduled at 6 months',
    ARRAY[
        'Pediatric shelter health evaluation: healthy dental development, clear chest',
        'Deworming completed on schedule with no parasites detected',
        '1st DP vaccine booked with partner clinic for next week',
        'Preventative spot-on tick defense administered',
        'Current weight: 2.5 kg, calm demeanor and healthy sleep routine'
    ],
    ARRAY[
        'Loving family who sees the beauty and loyalty in black Indian dogs',
        'Secure apartment or house with netted windows or high boundary walls',
        'Willingness to guide him through gentle puppyhood socialization',
        'Agreement for mandatory sterilisation at 6 months',
        'Pre-adoption house check and Haven Paws agreement'
    ],
    'Shadow is our quietest sibling. While his brothers romp around, Shadow happily settles beside your feet, resting his chin on your sneakers. He is fiercely loyal and very sweet.',
    'Hi Haven Paws team, I would love to give Shadow (#D04) a forever home! How can we proceed?',
    false,
    false,
    'available'
),
(
    'milo',
    '#D05',
    'Milo',
    'dog',
    'Puppy',
    'Indie Mix',
    '2 Months',
    'Male',
    'Small (Expected Medium)',
    'Tricolor Fawn & Black',
    'Rajanukunte, North Bangalore',
    '/images/4.jpeg',
    ARRAY['/images/4.jpeg', '/images/1.jpeg', '/images/3.jpeg'],
    'Milo - Tricolor puppy with white chest patch',
    ARRAY['Fast Learner', 'Loves Other Dogs', 'First Vaccine Done', 'Puppy'],
    '1st DP Completed',
    'Completed 2 cycles',
    'Scheduled at 6 months',
    ARRAY[
        'Full intake medical check: strong joint mobility, clear conjunctiva',
        '1st DP puppy vaccination administered on October 25, 2026',
        'Bi-weekly puppy deworming protocol successfully completed',
        'Nutritional monitoring: solid digestion and steady weight gain (2.8 kg)',
        'Oral exam shows healthy baby teeth eruption'
    ],
    ARRAY[
        'Family with or without other pets (Milo loves canine companions)',
        'Home with dedicated human presence or predictable work-from-home schedule',
        'Booster vaccination and rabies schedule adherence',
        'Mandatory neutering pledge at 6 months',
        'Adoption agreement with Haven Paws welfare oversight'
    ],
    'Milo is an intelligent, expressive puppy who learns household routines fast. He has already figured out how to sit politely when a treat is in sight and loves curling up with fellow pups.',
    'Hi Haven Paws team, Milo (#D05) caught my eye! When can I come over for a meet-and-greet?',
    false,
    false,
    'available'
),
(
    'amber',
    '#C01',
    'Amber',
    'cat',
    'Kitten',
    'Indie Domestic Shorthair',
    '3 Months',
    'Female',
    'Small',
    'Ginger & Cream Tabby',
    'Sahakara Nagar, North Bangalore',
    '/images/6.jpeg',
    ARRAY['/images/6.jpeg', '/images/5.jpeg', '/images/1.jpeg'],
    'Amber - Ginger and white kitten relaxing indoors',
    ARRAY['Litter Trained', 'Indoor Only', 'FeLV/FIV Negative', 'Kitten'],
    'Tricat Core Vaccine Done',
    'Dewormed & Defleaed',
    'Scheduled at 6 months',
    ARRAY[
        'Comprehensive feline physical exam: clear cornea, clean ear canals, negative ear mites',
        'Tricat (FVRCP) core vaccine administered on October 18, 2026',
        'Snap combo test: negative for FeLV (Feline Leukemia) and FIV',
        'Oral Broad-spectrum deworming tablet given twice at 14-day interval',
        '100% litter box trained with natural clay litter, weight: 1.2 kg'
    ],
    ARRAY[
        'Strictly indoor-only living environment (no unsupervised outdoor roaming)',
        'Mandatory window netting and balcony safety mesh in apartment or villa',
        'Tricat booster vaccination at 16 weeks + Annual Rabies',
        'Sterilisation agreement at 6 months through our recommended feline vet',
        'Adoption contract with Haven Paws'
    ],
    'Amber is a radiant little kitten with a nonstop purr. She loves chasing sunbeams across the floor and will softly headbutt your hands whenever she wants cuddles.',
    'Hi Haven Paws team, I am interested in adopting Amber (#C01)! Our apartment is balcony-netted and cat-ready.',
    false,
    false,
    'available'
),
(
    'rocky',
    '#D06',
    'Rocky',
    'dog',
    'Senior',
    'Indie Hound Mix',
    '7.5 Years',
    'Male',
    'Medium-Large (19 kg)',
    'Chestnut & White',
    'Rajanukunte, North Bangalore',
    '/images/5.jpeg',
    ARRAY['/images/5.jpeg', '/images/2.jpeg', '/images/4.jpeg'],
    'Rocky - Gentle senior dog resting gracefully',
    ARRAY['Gentle Senior', 'House Trained', 'Fully Vaccinated', 'Senior'],
    'Annual Booster & Rabies Done',
    'Regular 3-Month Cycle',
    'Neutered',
    ARRAY[
        'Senior wellness profile & blood panel (CBC + Kidney/Liver profile): all normal',
        'Annual 9-in-1 mega booster + Anti-Rabies vaccine updated August 2026',
        'Joint supplement regimen (Glucosamine + Chondroitin) started for mild age stiffness',
        'Complete dental prophylaxis and ultrasonic scaling completed',
        'Heartworm antigen test: negative, current weight 19.2 kg'
    ],
    ARRAY[
        'Quiet, gentle home without rough high-energy play demands',
        'Ground floor access or elevator-equipped building (to avoid multiple steep stairs)',
        'Committed guardian who values the wisdom and peace of a senior rescue',
        'Commitment to continuous joint supplements and annual senior health checkups',
        'Adoption pledge with Haven Paws lifetime welfare support'
    ],
    'Rocky is a dignified, serene gentleman who has spent years being a loyal guardian. He asks for very little: a soft rug, a predictable 20-minute morning stroll, and quiet companionship by your side.',
    'Hi Haven Paws team, I have a deep spot for senior dogs and would love to give Rocky (#D06) a peaceful forever home.',
    false,
    true,
    'available'
),
(
    'cleo',
    '#C02',
    'Cleo',
    'cat',
    'Special-needs',
    'Indie Domestic Shorthair',
    '4-5 Months',
    'Female',
    'Small (2.1 kg)',
    'Ginger & Cream Tabby',
    'Sahakara Nagar, North Bangalore',
    '/images/6.jpeg',
    ARRAY['/images/6.jpeg', '/images/5.jpeg', '/images/1.jpeg'],
    'Cleo - Resilient special needs kitten with bright eyes',
    ARRAY['Special Needs', 'Litter Trained', 'Spayed', 'Gentle Soul'],
    'Tricat & Rabies Complete',
    'Fully Dewormed',
    'Spayed & Microchipped',
    ARRAY[
        'Orthopedic and neurological recovery assessment: healed pelvic fracture from early kittenhood rescue',
        'Slightly altered gait in left hind leg; verified 100% pain-free and fully mobile by veterinary surgeon',
        'Complete Tricat core vaccination + Rabies vaccination administered',
        'Spay surgery and microchip placement completed successfully in September 2026',
        'Regular weight monitoring: 2.1 kg, thriving on balanced wet and dry food'
    ],
    ARRAY[
        'Strictly 100% indoor home with non-slip carpets or rugs to assist traction',
        'Window mesh and balcony netting mandatory prior to adoption visit',
        'Low-entry litter box for effortless access without high jumping',
        'Adopter who understands and celebrates special-needs companions',
        'Lifetime adoption check-ins with Haven Paws feline team'
    ],
    'Cleo is living proof that resilience comes in small furry packages. Despite an early accident, she runs, climbs onto sofa cushions, and purrs like a tiny motorboat. She is deeply affectionate and will steal your heart in seconds.',
    'Hi Haven Paws team, I am moved by Cleo (#C02) and want to offer her a loving, safe, special-needs friendly home!',
    true,
    false,
    'available'
),
(
    'oreo',
    '#O01',
    'Oreo & Squeak',
    'other',
    'Special-needs',
    'Bonded Pair Guinea Pigs',
    '1 Year',
    'Male',
    'Small Pair (0.9 kg each)',
    'Black, White & Calico',
    'Sahakara Nagar, North Bangalore',
    '/images/5.jpeg',
    ARRAY['/images/5.jpeg', '/images/7.jpeg', '/images/1.jpeg'],
    'Oreo and Squeak - Pair of adorable bonded guinea pigs',
    ARRAY['Bonded Pair', 'Pocket Pets', 'Vegetarian Diet', 'Special Needs'],
    'Veterinary Health Checked',
    'Dewormed (Small Animal Protocol)',
    'Not Applicable',
    ARRAY[
        'Exotic pet veterinary health clearance: clear teeth alignment (no malocclusion)',
        'Routine vitamin C supplementation verified and maintained daily',
        'Skin and coat inspection: clean, free of fungal spores and external mites',
        'Dietary schedule: 80% Timothy hay, fresh bell peppers, and fortified guinea pig pellets',
        'Regular weigh-ins: Oreo (920g), Squeak (890g) — both active with cheerful wheeking'
    ],
    ARRAY[
        'Must be adopted together as a bonded pair (cannot be separated)',
        'Spacious indoor C&C cage enclosure (minimum 10.5 sq ft) with fleece bedding',
        'Daily supply of fresh Timothy hay, clean water, and Vitamin-C-rich veggies (capsicum, coriander)',
        'Safe, temperature-controlled environment away from direct hot sunlight or drafts',
        'Adoption agreement acknowledging bonded pair lifelong care'
    ],
    'Oreo and Squeak are an inseparable pair of bonded guinea pigs surrendered due to a relocation. They wheek happily in stereo when the refrigerator door opens for fresh coriander and love curling up inside fleece tunnels together.',
    'Hi Haven Paws team, I would love to adopt the bonded guinea pig pair Oreo & Squeak (#O01)! My indoor enclosure is ready.',
    true,
    false,
    'available'
)
ON CONFLICT (slug) DO UPDATE SET
    adoption_code = EXCLUDED.adoption_code,
    name = EXCLUDED.name,
    species = EXCLUDED.species,
    badge_label = EXCLUDED.badge_label,
    breed = EXCLUDED.breed,
    age = EXCLUDED.age,
    gender = EXCLUDED.gender,
    size = EXCLUDED.size,
    color = EXCLUDED.color,
    location = EXCLUDED.location,
    image = EXCLUDED.image,
    gallery = EXCLUDED.gallery,
    alt = EXCLUDED.alt,
    tags = EXCLUDED.tags,
    vaccination_status = EXCLUDED.vaccination_status,
    dewormed_status = EXCLUDED.dewormed_status,
    sterilisation_status = EXCLUDED.sterilisation_status,
    medical_history = EXCLUDED.medical_history,
    adoption_requirements = EXCLUDED.adoption_requirements,
    story = EXCLUDED.story,
    whatsapp_message = EXCLUDED.whatsapp_message,
    is_special_needs = EXCLUDED.is_special_needs,
    is_senior = EXCLUDED.is_senior,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());

-- ==============================================================================
-- 11. SEED INITIAL SUCCESS STORIES
-- ==============================================================================
INSERT INTO adoption_records (
    pet_slug, pet_name, species_label, adopter_names, neighborhood, adopted_date,
    image, before_note, after_quote
) VALUES
(
    'kaju',
    'Biscuit (now Bruno)',
    'Indie Dog',
    'Ananya & Rohan',
    'Yelahanka, Bangalore',
    'October 2026',
    '/images/1.jpeg',
    'Found huddled near a construction site at 6 weeks old.',
    'He still pokes his tongue out every time he naps on our sofa after his evening walk. The care team helped us settle him in during his very first week.'
),
(
    'rocky',
    'Peanut',
    'Indie Mix',
    'Karthik Nair',
    'Indiranagar, Bangalore',
    'September 2026',
    '/images/5.jpeg',
    'Shy tri-color pup who warmed up over lawn playtime.',
    'We were nervous as first-time dog parents, but getting honest advice about crate training and feeding schedules made the whole transition effortless.'
),
(
    'amber',
    'Mochi',
    'Ginger Tabby Cat',
    'Meera Deshmukh',
    'Hebbal, Bangalore',
    'August 2026',
    '/images/6.jpeg',
    'Rescued near Devanahalli and litter-trained indoors.',
    'Within two days she claimed the sunny spot right next to my desk window. Watching her purr through work calls is easily the best part of my day.'
);
