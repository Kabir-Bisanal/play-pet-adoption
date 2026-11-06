# Play Pet Adoption — Website Expenses & Maintenance Quotation

This document breaks down all infrastructure, third-party services, recurring operational costs, and recommended maintenance packages so you can present clear, transparent pricing options to the client.

---

## 1. Domain Name Expenses

The client mentioned they will provide the domain name. Here are the expected purchase costs depending on the TLD chosen:

| Domain Option | Example | Estimated Cost (Year 1) | Renewal Cost (Annual) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **`.in` Domain** | `playpetadoption.in` | ₹499 – ₹799 (~$6 – $10) | ₹799 – ₹999/yr | Highly recommended for India/Bangalore audience. |
| **`.com` Domain** | `playpetadoption.com` | ₹899 – ₹1,299 (~$11 – $16) | ₹1,299 – ₹1,599/yr | Standard global choice. |
| **Subdomain (Zero Cost)** | `adopt.playpetboarding.com` | **₹0 (Free)** | **₹0 (Free)** | Leverages their existing `playpetboarding.com` domain with a DNS record! |

> **Pro Tip for Client:** If they already own `playpetboarding.com`, they can create `adopt.playpetboarding.com` completely free of charge. If they want a fresh brand identity, a dedicated `.in` or `.com` domain is the way to go.

---

## 2. Infrastructure & Service Cost Breakdown (Itemized)

We present two architectural paths:
* **Option A (Modern Serverless & Headless CMS - Recommended):** Modern Next.js stack with Sanity/Supabase. Blazing fast, zero server crashes, and almost **₹0 recurring infrastructure bills** for 25–100 pets.
* **Option B (Traditional Managed / WordPress Stack):** Managed hosting like Hostinger or DigitalOcean. Requires monthly server subscriptions.

### Option A: Modern Lean Architecture (Recommended)

| Item / Service | Provider | Purpose | Free Tier Limit | Production Cost | Billing Cycle |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Hosting & CDN** | Vercel / Cloudflare Pages | Hosts the website globally on high-speed CDN edge | 100 GB bandwidth / mo (plenty for 50,000+ monthly visits) | **₹0 / mo** (Free Tier) | Monthly |
| **Database & CMS** | Sanity.io or Supabase | Stores pet details, profiles, and image uploads. Provides client dashboard. | Up to 10k documents / 500MB DB (more than enough for 25–100 pets) | **₹0 / mo** (Free Tier) | Monthly |
| **SSL Certificate** | Let's Encrypt (via Vercel/Cloudflare) | HTTPS green lock / security encryption | Unlimited | **₹0 / mo** (Included) | Automatic |
| **Inquiry Email Delivery** | Resend | Sends adoption application notifications to the client's email | 3,000 emails/mo, 100 emails/day | **₹0 / mo** (Free Tier) | Monthly |
| **WhatsApp Direct Connect** | WhatsApp Click-to-Chat API | Direct button opening WhatsApp with pre-filled message | Unlimited | **₹0 / mo** (Free) | None |
| **Image CDN / Storage** | Sanity / Cloudinary / Supabase Storage | Optimizes and serves pet photos fast | 5GB to 10GB asset storage | **₹0 / mo** (Free Tier) | Monthly |
| **Total Infrastructure Bill** | | | | **₹0 / month** (+ Domain renewal ₹800–₹1,300/yr) | |

> **Why this matters for your client pitch:** You can tell the client: *"We architect the website using modern cloud infrastructure so your monthly server and database bills are ₹0. You only pay for your annual domain registration."* This is a massive selling point over agencies that charge ₹2,000/mo just for low-tier shared hosting.

---

### Option B: Traditional Managed Hosting (Alternative)

If the client prefers a single traditional hosting cPanel or WordPress setup:

| Item / Service | Provider | Purpose | Estimated Cost (INR) | Estimated Cost (USD) | Billing Cycle |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cloud / Shared Hosting** | Hostinger Business / SiteGround | Server hosting + database + SSL | ₹249 – ₹499 / mo | $3 – $6 / mo | Billed annually (~₹3,500 – ₹6,000/yr) |
| **Custom Business Email** | Google Workspace or Zoho Mail | `adoptions@playpetboarding.com` | ₹125 – ₹250 / user / mo (or Free via Zoho Mail Lite) | $1.50 – $3 / user / mo | Monthly / Annual |
| **Total Infrastructure Bill** | | | **~₹3,500 – ₹7,000 / year** | **~$45 – $85 / year** | Annual |

---

## 3. Maintenance & Support Packages (Your Service Retainers)

Besides pure infrastructure costs, you should present clear monthly/quarterly maintenance packages to give the client peace of mind.

| Tier | Package Name | What's Included | Recommended Fee (INR) | Recommended Fee (USD) |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | **On-Demand Maintenance** | • Pay-as-you-go per update.<br>• Minor text/photo updates done by developer on request.<br>• Troubleshooting & uptime checks as needed. | ₹1,000 – ₹1,500 / request (or ₹1,200/hr) | $20 – $30 / request |
| **Tier 2 (Recommended)** | **Standard Care Retainer** | • Monthly uptime & performance monitoring.<br>• Adding/updating up to 10 new pet listings per month.<br>• SEO health checks & image compression.<br>• Priority technical support via WhatsApp/call. | **₹3,500 – ₹5,000 / month** | **$45 – $65 / month** |
| **Tier 3** | **Growth & Content Retainer** | • Everything in Standard Care.<br>• Unlimited pet listing updates & status tracking.<br>• Monthly social media graphic/feature for adoptable pets.<br>• Quarterly feature additions or layout tweaks. | ₹8,000 – ₹12,000 / month | $100 – $150 / month |

---

## 4. One-Time Website Development Fee Guideline

Depending on how Kabir positions the project, here is the benchmark pricing for designing and building this custom adoption platform:

| Scope | Inclusions | Recommended Quote (INR) |
| :--- | :--- | :--- |
| **Standard Adoption Portal** | Custom responsive UI, ~25 pet listings pre-loaded, filter/search system, pet detail pages, WhatsApp connect, adoption form, FAQ & About section, SEO setup, client CMS dashboard for pet management. | **₹25,000 – ₹45,000** |
| **Add-on: Donation / Sponsoring Flow** | Razorpay / UPI payment gateway integration for food/medical sponsorship of specific pets. | **+ ₹7,500 – ₹12,000** |

---

## 5. Summary Cheat Sheet to Present to the Client

When presenting the expenses to the client, Kabir can say:

> *"For the website infrastructure, our primary goal is to keep your ongoing monthly expenses as close to zero as possible:*
> 1. **Domain:** ~₹800 to ₹1,300 per year (or completely free if we use `adopt.playpetboarding.com`).
> 2. **Server & Database:** ₹0/month on our modern cloud setup (saving you regular server hosting fees).
> 3. **WhatsApp & Form Inquiries:** Free and directly connected to your phone/inbox.
> 4. **Optional Maintenance:** We offer an ongoing care plan starting at ₹3,500/month if you'd like us to handle all updates, pet listing management, and tech monitoring for you, or we can train your team to use the dashboard with zero monthly fee."*
