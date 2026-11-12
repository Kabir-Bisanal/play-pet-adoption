# Play Pet Adoption — Locked Requirements & Step-by-Step Build Plan

**Client Source:** Shared ChatGPT Specification (`https://chatgpt.com/share/6af56e29-bba4-83e8-af66-0cc851aba9ae`)  
**Hosting & Backend Stack:** Next.js on **Vercel** + **Supabase** (Database, Auth, Photo Storage)  
**Workflow Rule:** Strict step-by-step execution. Wait for Kabir's confirmation and verification after every step before advancing.

---

## 1. Confirmed Client Decisions (Locked In)

| Decision Area | Confirmed Selection | Implementation Impact |
| :--- | :--- | :--- |
| **Who manages listings?** | **Our own rescue organisation** | No public user uploads; only internal team adds pets. |
| **Branding** | **Independent adoption brand** | Standalone adoption identity & navigation (tagline: *"Adopt. Love. Belong."*). Keep exact warm color grading (`#FAF7F2`, `#2D5A46`, `#E07A5F`, `#F4A261`, `#2B2523`). |
| **Scale & Admin Structure** | **One organisation, one admin** | Single rescue org with one primary **Admin Login** (simple, clean, low complexity; expandable later if staff accounts are added). |
| **Hosting & Backend** | **Vercel + Supabase** | Migrate away from static GitHub Pages (`github.io`) to Vercel + Supabase (both ₹0/month free tier, 1-click transferable). |
| **Media & Copy** | **Use existing `images/` + sample copy** | Reuse `1.jpeg`–`7.jpeg` for listings/galleries; write authentic sample bios, Success Stories, About Us, FAQs, and Adoption Terms. |
| **Notification / Admin Email** | **Sample placeholder email** | Use `adoptions@adoptlovebelong.org` (placeholder) until client supplies official email & domain. |

---

## 2. Step-by-Step Gated Execution Plan

Every step ends with a summary of exact changes made and waits for Kabir's verification before starting the next step.

| Step | Title | What Gets Built & Verified |
| :--- | :--- | :--- |
| **Step 1** *(Current)* | **Vercel Migration & Supabase Setup Prep** | Lock docs, add `vercel.json` for clean static deployment on Vercel, and provide Kabir the exact manual steps to link Vercel & create the Supabase project. |
| **Step 2** | **Next.js App Router Scaffold** | Convert single HTML file into a clean Next.js project preserving the exact color tokens, typography, smart header, and responsive cards. Deploy & verify on Vercel. |
| **Step 3** | **Independent Brand Pages & Sample Content** | Update branding (*"Adopt. Love. Belong."*), build **Home** (*Why Adopt?*, *Recently Added*, *Success Stories* preview), **7-Step Adoption Process**, **Success Stories**, **About Us**, **Contact Us**, and **FAQs**. |
| **Step 4** | **Search, Extended Filters & Multi-Photo Pet Profiles** | Add keyword search + filters (`Dogs`, `Puppies`, `Cats`, `Kittens`, `Special-needs`, `Senior`, `Other Animals`). Build `/adopt/[id]` detail page with photo gallery, visible Pet ID, Vaccination/Sterilisation status, Medical History, and Adoption Requirements. |
| **Step 5** | **Supabase Database, Storage & Live Data** | Create PostgreSQL tables (`pets`, `pet_photos`, `adoption_applications`, `adoption_records`, `activity_logs`) + Storage bucket (`pet-images`). Seed initial pets/stories and connect public pages to live Supabase data. |
| **Step 6** | **12-Field Online Adoption Application Form** | Build the complete 12-field **Apply to Adopt** form (alongside 1-click WhatsApp) saving directly into `adoption_applications` in Supabase. |
| **Step 7** | **Admin Login & Dashboard Overview** | Implement private `/admin/login` via Supabase Auth (single Admin account) + protected `/admin` Dashboard showing live KPIs (`Total Pets`, `Available`, `Applications`, `Adopted`). |
| **Step 8** | **Mobile-Friendly Admin Pet Management** | Build Add/Edit Pet forms with mobile photo upload (Main + Gallery), `Available`/`Pending`/`Draft` toggles, **Mark Adopted** (auto-moves to Success Stories), **Archive**, and Delete. |
| **Step 9** | **Adoption Applications CRM & Activity Logs** | Build `/admin/applications` to review applicant details, update review status (`New` → `Under review` → `Interview` → `Meet-and-greet` → `Approved` → `Rejected` → `Completed`), and view activity logs/reports. |
| **Step 10** | **Email Alerts, Final QA & Client Handoff** | Add automated email alert (Resend) on new applications using placeholder inbox, run full mobile/desktop QA, and prepare final Vercel + Supabase transfer checklist. |
