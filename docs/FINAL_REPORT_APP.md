# ROADMAP RECEIPTS WEB APPLICATION FINAL REPORT

- **Application Repository**: `hypercybers99/roadmap-receipts-app`
- **Deployment URL**: https://hypercybers99.github.io/roadmap-receipts-app/
- **Target Network**: GenLayer Studionet (Chain ID 61999, RPC https://studio.genlayer.com/api)
- **Status**: Preview
- **Application Release Tag**: `roadmap-receipts-app-v1`
- **Application Release Commit**: `651e4b40e844d23a1d5f62241996bf6ebc46da0f`
- **Contract Source Repository**: `hypercybers99/roadmap-receipts-genlayer` at commit `634a6b148326da078ff072a01bef88543a205161` (tag `rr-v1b`)

---

## 1. Verified Active Deployments & Contract Integrity

| Role | Contract Address | Deploy Tx Hash | Source SHA-256 | Source Diff |
| :--- | :--- | :--- | :--- | :--- |
| **RoadmapLedger (v2 Active)** | `0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4` | `0xc1a3f37d7197d57a126cef7908c309e819c37dc6e9cf5fd6a5ebcd2d8f2101b2` | `daef918508151db2a4a6a0086ace8bee55f39889dd47e4f74b99c6c7fa726aa4` | 0 bytes (exact match) |
| **TrancheGate (v2 Active)** | `0x5D869C10F523fdD2E3b0Db0CD5CA0107b25b4026` | `0x24532e069b090bc7dae24a6dcff25bec180b6af2f4f099491c46de6aae772da9` | `8377fc0141693eabcde991126a044ad225cde560adc683490e7199613f2a5548` | 0 bytes (exact match) |

*TrancheGate v2 constructor argument is explicitly bound to RoadmapLedger v2: `0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4`.*

### Superseded Contracts & Harness

- **RoadmapLedger (v1 Superseded)**: `0xD22E8C03EbB382D9A9df07829e18c2E4DDd6f67D`
- **TrancheGate (v1 Superseded)**: `0x437c45bD60e202Cc7C08C7C4A94e603649750fA8`
- **ProbeLabels Harness**: `0x100B6857aFD1f4f09FEeBb8652de3D7F686EE487`

---

## 2. Page List & Visual Evidence

### Application Pages & Interactions

| Route | Page | On-Chain Reads | On-Chain Writes |
| :--- | :--- | :--- | :--- |
| `/` | Landing Dashboard | `get_stats()`, `list_roadmaps(0, 10)`, `list_grants(0, 10)`, `get_limits()`, `balance_of(account)` | `faucet_mint()` (Claim 1,000 Demo Credits) |
| `/roadmaps/new` | Create Roadmap | `get_limits()` | `create_roadmap(spec_cid, weights, criteria)` |
| `/roadmaps/:id` | Roadmap Detail | `get_roadmap(id)`, `get_verification(id, milestone_idx)`, `get_milestone_status(id, milestone_idx)`, `compute_score(weights, statuses)` | `verify_milestone(id, milestone_idx)` |
| `/grants/new` | Create Grant | `get_roadmap(id)`, `balance_of(account)`, `get_limits()` | `create_grant(recipient, roadmap_id, tranches)` |
| `/grants/:id` | Grant Detail | `get_grant(id)`, `is_tranche_open(id, tranche_idx)`, `balance_of(account)`, `get_roadmap(grant.roadmap_id)` | `release_tranche(id, tranche_idx)`, `reclaim_tranche(id, tranche_idx)` |
| `/evidence` | On-Chain Evidence & Verification | Stored execution receipts, consensus outputs, decoded payloads, error translations | None (audit & readback view) |
| `/limits` | Contract Limits & Configuration | `RoadmapLedger.get_limits()`, `TrancheGate.get_stats()` | None (audit view) |

### Captured Visual Evidence (10 Images)

All screenshots captured in light and dark themes at 1280px (desktop) and 360px (mobile) viewports under `docs/screens/`:
- `docs/screens/desktop_dark_grant_detail.png`
- `docs/screens/desktop_dark_landing.png`
- `docs/screens/desktop_dark_roadmap_detail.png`
- `docs/screens/desktop_light_evidence.png`
- `docs/screens/desktop_light_grant_detail.png`
- `docs/screens/desktop_light_landing.png`
- `docs/screens/desktop_light_limits.png`
- `docs/screens/desktop_light_roadmap_detail.png`
- `docs/screens/mobile_dark_landing.png`
- `docs/screens/mobile_light_landing.png`

---

## 3. Error Mapping Parity & Golden Schema Verification

### Contract Error Dictionary (1:1 Bidirectional Parity)
- **RoadmapLedger Error Templates**: 31 in `RoadmapLedger.py` = 31 mapped in `src/lib/errors.ts` (0 diff)
- **TrancheGate Error Templates**: 28 in `TrancheGate.py` = 28 mapped in `src/lib/errors.ts` (0 diff)
- **Total Mapped Errors**: 59 unique contract error templates with plain language explanations, next-step suggestions, and verbatim template matching.

### Vitest Unit & Schema Suite Results (45 Passed)
- `tests/errors.test.ts` (4 passed): 1:1 error dictionary parity verified with 0 diffs in both directions.
- `tests/golden_types.test.ts` (12 passed): Validates all 12 on-chain golden JSON captures against TypeScript schemas.
- `tests/receipts.test.ts` (6 passed): Consensus validation rules, base64 payload decoding, error message translation.
- `tests/validators.test.ts` (23 passed): Form input boundary validation matching on-chain `get_limits`.

---

## 4. End-to-End On-Chain Transaction Audit & Invariant Proof

### Dynamic ID Handling Proof (Zero Hardcoded IDs)
Two roadmaps were created sequentially to prove dynamic ID resolution from receipt consensus outputs:
- **Roadmap 1 ID**: `16` (Tx: `0xf4e43609e900ab5bb206995c32055819bb77b84b35e6ddba87d2592742304136`)
- **Roadmap 2 ID**: `17` (Tx: `0x5849e1599c05c0cc538e9f85b7b7f47b23f8e1cd64cc27fef6aed41ff1103ffd`)
- **Grant ID**: `3` (Tx: `0x2bd4184936a594531adc05f44cce6966c33c3eade6a25e5866a9f5227c899c35`)

### On-Chain Write Operations

| Action | Transaction Hash | Status | Consensus | Execution | Latency | Decoded Output |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `create_roadmap_1` | `0xf4e43609e900ab5bb206995c32055819bb77b84b35e6ddba87d2592742304136` | ACCEPTED | MAJORITY_AGREE | SUCCESS | 9.64s | `"16"` |
| `create_roadmap_2` | `0x5849e1599c05c0cc538e9f85b7b7f47b23f8e1cd64cc27fef6aed41ff1103ffd` | ACCEPTED | MAJORITY_AGREE | SUCCESS | 8.46s | `"17"` |
| `verify_milestone_0` | `0xba2f5642f8ecca0b97a67dffaf44b37977687ca9f3fe79ff60d63db731752765` | ACCEPTED | MAJORITY_AGREE | SUCCESS | 11.85s | `"DELIVERED"` |
| `verify_milestone_1` | `0xb92052383aae117fc1296fdf27faca6c7d844123999238b0b36d57b712a15795` | ACCEPTED | MAJORITY_AGREE | SUCCESS | 11.72s | `"DELIVERED"` |
| `verify_milestone_2` | `0xccf436f5077313cb2837f12d5516295f79771d8c30919b4e3831c2b43d49b264` | ACCEPTED | MAJORITY_AGREE | SUCCESS | 18.21s | `"MISSED"` |
| `claim_demo_credits` | `0x0435c2091cb86d64c7d43440f89c289f0dd9bb3f5fcca144e51f478ac23db2d1` | ACCEPTED | MAJORITY_AGREE | SUCCESS | 8.42s | `"1000"` |
| `create_grant` | `0x2bd4184936a594531adc05f44cce6966c33c3eade6a25e5866a9f5227c899c35` | ACCEPTED | MAJORITY_AGREE | SUCCESS | 8.47s | `"3"` |
| `release_tranche_0` | `0xe896211670a9f2368cb2e114929c3db9dd6ea32c155f35756dbc1c3ed554c9e4` | ACCEPTED | MAJORITY_AGREE | SUCCESS | 8.34s | `"300"` |
| `reclaim_tranche_2` | `0x5bf9b25ec9f80baede85bf7c7d0384c708c35c3f51d34b7fef31e74dccd0be14` | ACCEPTED | MAJORITY_AGREE | SUCCESS | 8.34s | `"300"` |
| `release_tranche_1` | `0xea62bc05cf0fd6a98e24a6ae39ad60f259f52f91107c955e7217e55aaa1b4dcd` | ACCEPTED | MAJORITY_AGREE | SUCCESS | 8.56s | `"700"` |

### On-Chain Contract Refusals Tested

| Refusal Test Case | Transaction Hash | Status | Consensus | Execution | Latency | Decoded Contract Refusal |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Reclaim DELIVERED Tranche 0 | `0xa3457dd14af58091564882771b16a4738a11ea863ba327fc4d27b7b0b051476c` | ACCEPTED | MAJORITY_AGREE | ERROR | 8.53s | `"tranche already released"` |
| Attacker Reclaim Tranche 2 | `0x0462c990528054bc37af99b91154c88bac21c00d70cc7704f272f18d977c78af` | ACCEPTED | MAJORITY_AGREE | ERROR | 5.06s | `"not grant funder"` |
| Duplicate Reclaim Tranche 2 | `0xbef37727feef852a403fd478f6c8e2778e772bfccdff61328d4427d85c8db4c7` | ACCEPTED | MAJORITY_AGREE | ERROR | 8.33s | `"tranche already reclaimed"` |

### Balance Readbacks & Conservation Invariant
- **Final Funder Balance**: 300 Demo Credits
- **Final Recipient Balance**: 700 Demo Credits
- **Final Escrow Balance**: 0 Demo Credits
- **Total System Credits**: 1000 Demo Credits
- **Conservation Invariant**: **TRUE** (Exact conservation of 1,000 demo credits: 300 + 700 + 0 = 1000)

---

## 5. Quality Audits, Standards Compliance & CI/CD Proof

### Accessibility & Typography
- **WCAG AA Axe-Core Violations**: 0 violations across all desktop and mobile views
- **Base Typography**: Body font size `18px`, `line-height: 1.6`
- **Interactive Controls**: Touch target height >= `48px`
- **Mobile Viewport**: 0 horizontal overflow at 360px viewport width

### Design System Compliance
- **Gradients**: 0 gradient declarations found (`linear-gradient`, `radial-gradient`, `conic-gradient`)
- **Effects**: 0 glassmorphism or neon styling
- **Color Contrast**: All text/background combinations exceed 4.5:1 (ranging 5.10:1 to 15.33:1)
- **Banned Vocabulary**: 0 banned words found across repository files

### CI/CD Deployment Proof
- **GitHub Actions Run ID**: `42751876851`
- **Build & Test Job**: SUCCESS (28s)
- **Deploy Pages Job**: SUCCESS (14s)
- **Application URL**: https://hypercybers99.github.io/roadmap-receipts-app/

---

## 6. Contract Repository Fixes (`rr-v1b`)

- **Repository**: `hypercybers99/roadmap-receipts-genlayer`
- **Release Tag**: `rr-v1b`
- **Commit Hash**: `634a6b148326da078ff072a01bef88543a205161`
- **GitHub Actions Run ID**: `42746763355` (status: completed, conclusion: success)
- **Verified Deliverables**:
  - `docs/EXPECTED_RECLAIM.md`: Pre-registered reclaim expectations matching contract logic
  - `docs/evidence/onchain_reclaim_receipts.json`: 6 on-chain receipts validating reclaim flow
  - `docs/EXPECTED_VS_ACTUAL.md`: Updated without unverified latency claims
  - `scripts/verify_report_hashes.mjs`: Token verification audit with 0 errors

---

## 7. Deviations & Not Measured

1. **ProbeLabels Deploy Transaction**: The deploy transaction hash for ProbeLabels was not preserved in early run logs and is noted as "not available" (address `0x100B6857aFD1f4f09FEeBb8652de3D7F686EE487` was reused from the earlier benchmark harness).
2. **TrancheGate v2 Logic**: TrancheGate v2 source code has the exact same SHA-256 (`8377fc01...`) as v1, differing solely by the ledger address bound in its constructor (`0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4`).
3. **Demo Credits**: All credits handled by the contracts and displayed in the application are demo credits for interactive testing and verification, with no monetary value.
