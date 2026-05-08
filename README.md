# ⚡ SparkShares

> **Tokenized Micro‑Grant Marketplace for Creators.** Built for the [Bags Hackathon](https://bags.fm/).

A lightweight marketplace on the Bags platform where creators post **micro‑grant bounties** (small tasks, ideas, or mini‑projects) funded by community wallets and brands. Backers buy project tokens (SparkShares) to automatically distribute micro‑grants to contributors. Creators keep royalties, and contributors earn quickly. **This turns passive token launches into active community funding engines.**

---

## 🚀 Live Demo & Links

- **Live Site:** [Insert Vercel/Netlify Link Here]
- **Demo Video:** [Insert YouTube/Loom Link Here]
- **Hackathon Track:** [Insert Track Name Here]

---

## 💡 Why SparkShares?

- **High Product‑Market Fit:** Creators want funding + discoverability; backers want friction-free ways to support their favorite builders while earning rewards.
- **Direct Bags Integration:** Leverages the Bags SDK directly for project token launches, fee sharing (royalties), and founder/admin roles.
- **Micro-Grant Model:** Automates the tedious elements of bounty distribution—enabling low-cost, decentralized community incentives.

---

## 🛠️ Features

1. **Launch a Project (Bags SDK)**: Instantly deploy project tokens and configure fee-sharing.
2. **Micro-Grant Bounties**: Creators can mint tasks with small SOL or token rewards directly tied to their active Bags token.
3. **Submit Work**: Contributors browse out-standing micro-grants and submit their proofs of work (links, PRs, etc.).
4. **Approve & Distribute**: Creators review submissions safely on a slick interface and seamlessly trigger the contract to distribute the token/SOL micro-grants.
5. **Analytics Board**: Track how much work the community is generating, funds distributed, and royalty splits.

---

## ⚙️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Shadcn UI
- **Database / Backend:** Appwrite Tables DB (self-hosted)
- **Web3 Ecosystem:** Solana Web3.js, Wallet Adapter (Phantom, Solflare)
- **Host Platform:** Bags SDK + Platform APIs

---

## 💻 Running Locally

### Prerequisites
- Node.js >= 18
- An Appwrite project / self-hosted Appwrite instance
- A Solana Wallet (Phantom) set to Devnet
- Devnet SOL (for mocked Bags SDK transactions)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iamaanahmad/SparkShares.git
   cd SparkShares
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file at the root:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=sparkshares
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to explore.

---

## 🏆 Hackathon Notes (For Judges)
- **Bags Launch Fallback:** The Bags SDK Metaora integration currently requires Mainnet API keys for full fluid curves. For the sake of this Devnet prototype, the project launch routes default to a `MockTokenMintAddress_Devnet` safe fallback to demonstrate the UI/UX end-to-end without spending real Mainnet SOL.
- **Database Schema:** We now use Appwrite Tables DB for projects, bounties, submissions, and backings so the app can run on a self-hosted backend.

---

*This project was rapidly prototyped during the corresponding hackathon timeframe. PRs, suggestions, and feedback are highly welcomed!*
