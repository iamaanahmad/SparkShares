# ⚡ SparkShares

> **Tokenized Micro‑Grant Marketplace for Creators.** Built for the [Bags Hackathon](https://bags.fm/).

A lightweight marketplace on the Bags platform where creators post **micro‑grant bounties** (small tasks, ideas, or mini‑projects) funded by community wallets and brands. Backers buy project tokens (SparkShares) to automatically distribute micro‑grants to contributors. Creators keep royalties via **Bags V2 fee-sharing**, and contributors earn quickly. **This turns passive token launches into active community funding engines.**

---

## 🚀 Live Demo & Links

- **Live Site:** [https://spark-shares.vercel.app](https://spark-shares.vercel.app)
- **Demo Video:** [Coming Soon]
- **Hackathon Track:** Creator Tools
- **Contact:** [@iamaanahmad](https://x.com/iamaanahmad)

---

## 💡 Why SparkShares?

- **High Product‑Market Fit:** Creators want funding + discoverability; backers want friction-free ways to support their favorite builders while earning rewards.
- **Deep Bags Integration:** Leverages the Bags SDK directly for token launches via Meteora Dynamic Bonding Curves, **V2 fee-sharing** (configurable BPS splits), and founder/admin roles.
- **Micro-Grant Model:** Automates the tedious elements of bounty distribution—enabling low-cost, decentralized community incentives.
- **Community Governance:** Token holders can vote on bounty submissions, creating a democratic micro-grant system.

---

## 🛠️ Features

### Core Flow
1. **Launch a Project (Bags SDK)**: Deploy project tokens with automatic fee-sharing configuration. Set custom BPS splits for creators and collaborators.
2. **Micro-Grant Bounties**: Create tasks with SOL rewards tied to your Bags token. Enable community voting per bounty.
3. **Community Voting**: Token holders vote on submissions. The most-voted work rises to the top. True decentralized governance.
4. **Submit Work**: Contributors browse outstanding bounties and submit proofs of work (links, PRs, designs, etc.)
5. **Fund Bounty Pools**: Backers contribute SOL to increase bounty reward pools via on-chain transactions.
6. **Approve & Distribute**: Creators review submissions and trigger SOL payouts directly to contributor wallets via Solana.
7. **Analytics Dashboard**: Track funds raised, bounties completed, payouts distributed, and fee splits in real-time.

### Bags Integration Highlights
- **Token Launch**: Uses `sdk.tokenLaunch.createTokenInfoAndMetadata()` + `sdk.tokenLaunch.createLaunchTransaction()` for on-chain token deployment
- **Fee Sharing V2**: Uses `sdk.config.createBagsFeeShareConfig()` with configurable BPS splits (10000 = 100%)
- **Meteora Dynamic Bonding Curves**: Mainnet token launches leverage Meteora's AMM pools
- **Devnet Fallback**: For demo purposes, includes a devnet fallback with mock transactions when the Bags API requires mainnet

---

## ⚙️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **UI/UX:** Glassmorphism, animated gradients, neon accents, micro-animations
- **Database/Backend:** Appwrite TablesDB (self-hosted)
- **Web3 Ecosystem:** Solana Web3.js, Wallet Adapter (Phantom, Solflare)
- **Host Platform:** Bags SDK + Platform APIs
- **Deployment:** Vercel

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
   NEXT_PUBLIC_BAGS_API_KEY=your_bags_api_key
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

- **Bags Launch Integration:** The Bags SDK `createTokenInfoAndMetadata` + `createLaunchTransaction` + `createBagsFeeShareConfig` are all integrated. Mainnet token launches require SOL for Meteora pools; the app includes a devnet fallback for demo purposes.
- **Fee Sharing V2:** Every project launch configures fee-sharing via `sdk.config.createBagsFeeShareConfig()` with creator-controlled BPS splits. Demonstrates deep understanding of the Bags ecosystem.
- **Community Voting:** A lightweight on-chain governance mechanism where wallet-connected users vote on bounty submissions before creator approval.
- **Database Schema:** Uses Appwrite TablesDB for projects, bounties, submissions, backings, and votes.
- **Tokenomics:** $SPARK token (or user-defined symbol) deployed via Bags SDK, with fee-sharing royalties funding the community bounty pool.

---

## 📊 Database Schema

| Table | Fields |
|-------|--------|
| `projects` | $id, name, description, bags_token_mint, creator_wallet, fee_sharing_enabled, fee_share_bps, created_at |
| `micro_grants` | $id, project_id, title, description, reward_amount, status, voting_enabled, created_at |
| `submissions` | $id, grant_id, submitter_wallet, content, created_at |
| `backings` | $id, grant_id, backer_wallet, amount_sol, tx_signature, created_at |
| `votes` | $id, submission_id, grant_id, voter_wallet, created_at |

---

*This project was built for the Bags Hackathon. PRs, suggestions, and feedback are highly welcomed!*
