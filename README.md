# Roadmap Receipts Web Application

> **Preview Application**: [https://hypercybers99.github.io/roadmap-receipts-app/](https://hypercybers99.github.io/roadmap-receipts-app/)  
> **Target Network**: GenLayer Studionet (Chain ID `61999`)  
> **RPC Endpoint**: `https://studio.genlayer.com/api`  
> **Status**: Preview  
> **Contract Source Repo**: [hypercybers99/roadmap-receipts-genlayer (tag rr-v1)](https://github.com/hypercybers99/roadmap-receipts-genlayer/tree/rr-v1)

---

## 1. Overview

**Roadmap Receipts** is a decentralized web application for registering immutable project roadmaps, running consensus-based milestone verification, computing deterministic progress scores, and releasing or reclaiming milestone-gated escrow grants on GenLayer Studionet.

All state reads interact directly with the active v2 contracts on GenLayer Studionet without requiring a wallet. Wallet connection (MetaMask / EIP-1193) is required only for write transactions (`create_roadmap`, `verify`, `update_evidence`, `claim_demo_credits`, `create_grant`, `release`, `reclaim`).

> **Demo Credits Notice**: Balances and grant tranches use simulated internal demo credits intended exclusively for testing escrow release and reclaim rules on the preview chain. They carry zero monetary value.

---

## 2. Deployed Contracts (GenLayer Studionet)

### Active Pair (v2)

| Contract | Address | Source SHA-256 | Explorer Link |
| :--- | :--- | :--- | :--- |
| **RoadmapLedger** | `0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4` | `daef918508151db2a4a6a0086ace8bee55f39889dd47e4f74b99c6c7fa726aa4` | [View on Explorer](https://explorer-studio.genlayer.com/address/0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4) |
| **TrancheGate** | `0x5D869C10F523fdD2E3b0Db0CD5CA0107b25b4026` | `8377fc0141693eabcde991126a044ad225cde560adc683490e7199613f2a5548` | [View on Explorer](https://explorer-studio.genlayer.com/address/0x5D869C10F523fdD2E3b0Db0CD5CA0107b25b4026) |

*Note: `TrancheGate` v2 is constructor-bound to active `RoadmapLedger` `0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4`.*

### Superseded Pair (v1) & Harness

- **RoadmapLedger (v1)**: `0xD22E8C03EbB382D9A9df07829e18c2E4DDd6f67D`
- **TrancheGate (v1)**: `0x437c45bD60e202Cc7C08C7C4A94e603649750fA8`
- **ProbeLabels Harness**: `0x100B6857aFD1f4f09FEeBb8652de3D7F686EE487`

---

## 3. Key Capabilities & Design Architecture

1. **Tripwire-Gated Consensus Pipeline**:
   - Verification runs execute deterministic pre-checks (HTML stripping, length bounds, normalized SHA-256) before consensus model evaluation.
   - Prompt injections and malformed inputs are tripped early and assigned `REVIEW` or `MISSED` status with verbatim quotes suppressed.
2. **Deterministic Progress Calculation**:
   - Completion scores are calculated on-chain via `compute_score(weights_json, statuses_json)`:
     $$\text{Progress \%} = \frac{\sum (\text{weight}_i \times \text{status\_multiplier}_i)}{\sum \text{weight}_i} \times 100$$
   - `DELIVERED` = 100%, `PARTIAL` = 50%, `MISSED` / `REVIEW` / `PENDING` = 0%.
3. **Tranche-Gated Grant Escrow**:
   - Internal demo credits are locked in escrow and bound to milestone indices.
   - Anyone may call `release(grant_id, tranche_index)` once a milestone is verified `DELIVERED`.
   - Only the funder may call `reclaim(grant_id, tranche_index)` when a milestone is verified `MISSED`.
4. **Conservation of Escrow Value**:
   - Every demo credit locked in escrow is either released to recipient or reclaimed to funder.
   - Verified on chain: $\text{Funder Balance} + \text{Recipient Balance} + \text{Escrow Balance} = \text{Initial Minted Credits}$.
5. **Decoded Error Dictionary (59/59 1:1 Parity)**:
   - All 59 contract `UserError` templates (31 RoadmapLedger + 28 TrancheGate) are mapped to human-readable explanations and actionable next steps.
   - Contract refusals arriving as `MAJORITY_AGREE` with leader `ERROR` are automatically parsed and displayed in `TxStatusModal`.

---

## 4. Visual Identity & Accessibility Standard

- **Typography**: Base body font is **18px** (`line-height: 1.6`).
- **Touch Targets**: All interactive buttons, inputs, and selects meet **>= 48px** height.
- **Focus Rings**: 3px solid high-contrast outline (`outline-offset: 2px`).
- **Palette**: Natural, earthy tones with **0 gradients** (`linear-gradient`, `radial-gradient`, `conic-gradient`), 0 glassmorphism, 0 neon accents.
  - Page Background: `#F7F4EC` (Light) / `#181916` (Dark)
  - Ink Text: `#22231F` (Light) / `#EDECE6` (Dark)
  - Olive Accent: `#4F6B3A` / `#8BB370`
  - Clay Accent: `#A0451E` / `#F3BAA4`
  - Sand Card: `#EEE8D8` / `#252722`
- **Contrast**: Every foreground/background combination passes WCAG AA minimum contrast ratio of **>= 4.5:1** (e.g., `#22231F` on `#F7F4EC` achieves 14.38:1; `#A0451E` on `#EEE8D8` achieves 5.10:1).
- **Axe-Core Verified**: Zero accessibility violations detected by Playwright axe-core audit.
- **Mobile Responsive**: Fully verified at **360px width** (zero horizontal scrollbar / overflow).

---

## 5. Getting Started & Local Development

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/hypercybers99/roadmap-receipts-app.git
cd roadmap-receipts-app

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev

# Run Vitest unit & golden schema tests
npm test

# Run design identity & banned word scans
npm run scan:banned
npm run scan:gradients
npm run scan:contrast

# Build production bundle for GitHub Pages
npm run build

# Preview production build locally
npm run preview
```

### Running Playwright Browser Suite

```bash
# Install Playwright Chromium browser
npx playwright install chromium

# Run all 14 Playwright tests (accessibility, 360px overflow, and screenshots)
npx playwright test
```

### Running On-Chain End-to-End Suite

```bash
# Executes on-chain lifecycle on GenLayer Studionet using throwaway accounts
node scripts/e2e_full_chain.mjs
```

---

## 6. Directory Structure

```
roadmap-receipts-app/
├── contracts/                  # Read-only contract source files matching on-chain deploy payload
│   ├── RoadmapLedger.py
│   └── TrancheGate.py
├── docs/
│   ├── evidence/               # On-chain test receipts, error receipts, and E2E summaries
│   │   ├── e2e_summary.json
│   │   └── e2e_*.json
│   └── screens/                # Captured desktop & mobile screenshots (light & dark)
├── scripts/
│   ├── capture_golden.mjs      # Reads 12 real contract outputs directly from Studionet
│   ├── e2e_full_chain.mjs      # Complete on-chain E2E suite
│   ├── scan_banned.mjs         # Scans for forbidden words (status must be Preview)
│   ├── scan_contrast.mjs       # Verifies WCAG AA >= 4.5:1 contrast ratios
│   ├── scan_gradients.mjs      # Ensures 0 gradients and 0 glassmorphism
│   ├── sync_deployments.mjs    # Syncs deployment addresses from contract repo
│   ├── sync_evidence.mjs       # Syncs evidence from contract repo
│   └── verify_contracts.mjs    # Verifies contract source against on-chain deploy payload
├── src/
│   ├── components/             # Reusable UI components (Header, Footer, OutcomeStamp, TxStatusModal)
│   ├── config/                 # Deployment addresses and network configuration
│   ├── context/                # React contexts (ThemeContext, WalletContext)
│   ├── data/                   # Synced evidence and contract data
│   ├── lib/                    # Core libraries (errors dictionary, receipts layer, validators)
│   ├── pages/                  # Application views (Landing, Roadmaps, Grants, Credits, Evidence, Limits)
│   ├── services/               # Typed readClient (zero-wallet) and walletClient (EIP-1193)
│   ├── styles/                 # theme.css and Tailwind styles
│   └── types/                  # TypeScript contract and application types
└── tests/
    ├── e2e/                    # Playwright test specs
    ├── golden/                 # 12 real on-chain captured outputs
    ├── errors.test.ts          # 1:1 error mapping verification (59/59)
    ├── golden_types.test.ts    # Schema validation against on-chain golden JSONs
    ├── receipts.test.ts        # Receipt consensus rule and base64 error decoding tests
    └── validators.test.ts      # Client-side input validation tests
```

---

## 7. License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
Roadmap Receipts © 2026 hypercybers99.
