# Client Handoff, Access & Isolation Guide

**Project:** Play Pet Adoption  
**Client:** Play Pet Boarding ([playpetboarding.com](https://playpetboarding.com))  
**Purpose:** Ensure 100% separation from personal projects and provide frictionless transfer of access/ownership to the client.

---

## 1. Local Machine Isolation (Status: Verified ✅)

- **Dedicated Root:** `D:\Side Hustle\Play Pet Adoption\` is its own standalone Git repository with an independent `.git` directory.
- **Zero Cross-Dependencies:** There are no shared packages, symlinks, or configuration links with any other directory inside `D:\Side Hustle` (such as `Reddit Developer` or `Web Development Business Research`).
- **Portability:** You can copy or zip `D:\Side Hustle\Play Pet Adoption\` at any time and deliver it as a complete, standalone package.

---

## 2. GitHub Isolation Strategy: Protecting Your Personal Projects

When working with clients, you never share your personal GitHub account password. Instead, you have two industry-standard, completely secure handoff paths:

### Path A: Deploy under your GitHub & Transfer Ownership in 1-Click (Recommended)
1. **Initial Deployment:** Push the repository to your GitHub under `Kabir-Bisanal/play-pet-adoption`.
   - Your other repositories (private projects, Reddit tools, etc.) remain **completely invisible** and inaccessible to anyone.
2. **Sharing Preview Access:** If the client or their team wants to inspect the code before final delivery, go to:
   - `Repository Settings` → `Collaborators` → `Add people` → Enter client's GitHub username.
   - They get access **only** to `play-pet-adoption`. They cannot see or touch any other repo in your account.
3. **Final Handoff (Ownership Transfer):** Once final payment is completed:
   - Go to `Settings` → Scroll to **Danger Zone** → Click **Transfer ownership**.
   - Enter the client's GitHub username or organization name.
   - The entire repository, GitHub Pages setup, and commit history transfer into their account in seconds.
   - Your account is now completely detached from the project.

---

### Path B: Create a Dedicated Client Organization / Account (Zero Personal Overlap)
If the client asks for direct credentials (username & password) rather than an ownership transfer:
1. Create a free GitHub account or Organization specifically for the client (e.g., `playpetboarding-tech`).
2. Push the repository to that dedicated account.
3. When the contract wraps up, hand over the email, username, and password for that specific account.
4. Your personal account (`Kabir-Bisanal`) is never involved in the handoff.

---

## 3. Client Handoff Checklist (What to Hand Over Upon Completion)

When the client requests full access, deliver this clean access card:

| Asset / Service | Access Type | Where to Manage | Handoff Action |
| :--- | :--- | :--- | :--- |
| **Code Repository** | Git / GitHub | GitHub Repo | Transfer repository ownership or invite as Admin collaborator. |
| **Live Hosting** | GitHub Pages / Cloudflare | Settings → Pages | Handed over automatically with repository ownership. |
| **Domain & DNS** | DNS Provider (GoDaddy / Cloudflare) | Client's Domain Registrar | Provide CNAME record: `adopt.playpetboarding.com` → `<username>.github.io`. |
| **WhatsApp Inquiries** | Direct Link | `index.html` | Phone number `+91 86304 38778` configured. Editable in code anytime. |
| **Source Assets** | Original Images & Media | `/images` directory | Full high-res image package included in repository. |

---

## 4. How to Update Pet Details in the Code (For Client Reference)

If the client or their staff wants to update pet statuses or details without a developer:
1. Open `index.html`.
2. Scroll to line ~1395 (the `const PETS = { ... }` block).
3. Change any pet's status from `"Available"` to `"Adopted"` or update age/vaccination notes.
4. Save and commit. GitHub Pages updates the live website automatically in ~60 seconds.
