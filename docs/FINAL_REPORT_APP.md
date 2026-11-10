# ROADMAP RECEIPTS WEB APPLICATION FINAL REPORT

- **Application Repository**: `hypercybers99/roadmap-receipts-app`
- **Deployment URL**: https://hypercybers99.github.io/roadmap-receipts-app/
- **Target Network**: GenLayer Studionet (Chain ID 61999, RPC https://studio.genlayer.com/api)
- **Status**: Preview
- **Application Git HEAD**: `8c4f2d92074e2c40a5410026861dbcbaa203dfaa` (10 commits)
- **Application Release Tag**: `roadmap-receipts-app-v1`
- **Contract Source Repository**: `hypercybers99/roadmap-receipts-genlayer` at commit `634a6b148326da078ff072a01bef88543a205161` (tag `rr-v1b`)

---

## 1. Verified Active Deployments (GenLayer Studionet)

| Role | Contract Address | Deploy Tx Hash | Source SHA-256 |
| :--- | :--- | :--- | :--- |
| **RoadmapLedger (v2 Active)** | `0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4` | `0xc1a3f37d7197d57a126cef7908c309e819c37dc6e9cf5fd6a5ebcd2d8f2101b2` | `daef918508151db2a4a6a0086ace8bee55f39889dd47e4f74b99c6c7fa726aa4` |
| **TrancheGate (v2 Active)** | `0x5D869C10F523fdD2E3b0Db0CD5CA0107b25b4026` | `0x24532e069b090bc7dae24a6dcff25bec180b6af2f4f099491c46de6aae772da9` | `8377fc0141693eabcde991126a044ad225cde560adc683490e7199613f2a5548` |

*TrancheGate v2 constructor argument is explicitly bound to RoadmapLedger v2: `0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4`.*

### Superseded Contracts & Harness

- **RoadmapLedger (v1 Superseded)**: `0xD22E8C03EbB382D9A9df07829e18c2E4DDd6f67D`
- **TrancheGate (v1 Superseded)**: `0x437c45bD60e202Cc7C08C7C4A94e603649750fA8`
- **ProbeLabels Harness**: `0x100B6857aFD1f4f09FEeBb8652de3D7F686EE487`

---

## 2. Dynamic ID Handling Proof (Zero Hardcoded IDs)

Two roadmaps were registered sequentially on-chain by `scripts/e2e_full_chain.mjs` to prove dynamic ID resolution from receipt return values:

- **Roadmap 1 ID**: `16` (Tx: `0x0462c990528054bc37af99b91154c88bac21c00d70cc7704f272f18d977c78af`, Latency: 5.06s)
- **Roadmap 2 ID**: `17` (Tx: `0x0435c2091cb86d64c7d43440f89c289f0dd9bb3f5fcca144e51f478ac23db2d1`, Latency: 8.42s)
- **Grant ID**: `3` (Tx: `0xa3457dd14af58091564882771b16a4738a11ea863ba327fc4d27b7b0b051476c`, Latency: 8.53s)

---

## 3. On-Chain Reclaim & Conservation Invariant Proof

Executed on-chain by `scripts/e2e_full_chain.mjs` on Roadmap #16 and Grant #3:
- Milestone M0 (`m1-delivered.md`): verified **DELIVERED** (Tx: `0x2bd4184936a594531adc05f44cce6966c33c3eade6a25e5866a9f5227c899c35`)
- Milestone M1 (`m2-delivered.md`): verified **DELIVERED** (Tx: `0xf4e43609e900ab5bb206995c32055819bb77b84b35e6ddba87d2592742304136`)
- Milestone M2 (`m3-missed.md`): verified **MISSED** (Tx: `0x5849e1599c05c0cc538e9f85b7b7f47b23f8e1cd64cc27fef6aed41ff1103ffd`)
- Claim Demo Credits: 1,000 demo credits minted (Tx: `0xbef37727feef852a403fd478f6c8e2778e772bfccdff61328d4427d85c8db4c7`)
- Create Grant: 900 demo credits locked into escrow (Funder: 100, Escrow: 900)
- Release Tranche 0 (300 credits for DELIVERED M0): succeeded (Recipient: 300, Escrow: 600)
- Reclaim Tranche 0 Refusal: correctly refused with decoded payload `"300"`
- Attacker Reclaim Refusal: correctly refused with decoded payload `"700"`
- Reclaim Tranche 2 (200 credits for MISSED M2): succeeded (Funder: 100 + 200 = 300, Escrow: 400)
- Duplicate Reclaim Refusal: correctly refused with decoded payload `"33"`
- Release Tranche 1 (400 credits for DELIVERED M1): succeeded (Recipient: 300 + 400 = 700, Escrow: 0)

### Conservation Invariant Readback

- **Final Funder Balance**: 300 Demo Credits
- **Final Recipient Balance**: 700 Demo Credits
- **Final Escrow Balance**: 0 Demo Credits
- **Total System Credits**: 1000 Demo Credits
- **Conservation Invariant Holds**: **TRUE** (Exact conservation of 1,000 demo credits)

---

## 4. Contract Error Dictionary (1:1 Bidirectional Parity)

- **RoadmapLedger Error Templates**: 31 in contract `RoadmapLedger.py` = 31 mapped in `src/lib/errors.ts` (0 diff)
- **TrancheGate Error Templates**: 28 in contract `TrancheGate.py` = 28 mapped in `src/lib/errors.ts` (0 diff)
- **Total Mapped Errors**: 59 unique contract error templates with plain language explanations, next-step recommendations, and verbatim raw template matching.
- **Unit Test Parity**: `tests/errors.test.ts` passed 4/4 assertions.

---

## 5. Test Suite & Verification Results

### Vitest Unit & Golden Schema Tests (45 Passed)
- `tests/errors.test.ts`: 4 passed (1:1 error parity audit)
- `tests/golden_types.test.ts`: 12 passed (validates all 12 on-chain golden JSON captures against TypeScript types)
- `tests/receipts.test.ts`: 6 passed (consensus rule, base64 payload decoding, error mapping)
- `tests/validators.test.ts`: 23 passed (client-side form validation matching on-chain `get_limits`)

### Playwright Browser & Accessibility Suite (14 Passed)
- **Axe-Core Accessibility**: 0 violations on desktop and mobile
- **Base Typography**: Body font computed size >= 18px (`font-size: 18px`, `line-height: 1.6`)
- **Touch Targets**: Minimum interactive element height >= 48px
- **Mobile Responsive**: 0 horizontal overflow at 360px viewport width
- **Theme Toggle**: Light / Dark mode toggle verified on DOM root

### Static Analysis & Design Identity Scans
- **Forbidden Vocabulary Scan**: 0 occurrences detected across all project files
- **Visual Identity Scan**: 0 gradients (`linear-gradient`, `radial-gradient`, `conic-gradient`), 0 glassmorphism/neon
- **WCAG AA Contrast Scan**: All color combinations exceed **4.5:1** (e.g. ink on page: 14.38:1; white on olive: 6.01:1; clay on sand: 5.10:1; brick on page: 6.29:1)

---

## 6. Captured Screenshot Evidence (10 Images)

All captured screenshots are stored in `docs/screens/`:
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

## 7. Audit Verification Summary

| Audit Item | Expected | Actual | Result |
| :--- | :--- | :--- | :--- |
| **Active Contracts Pair** | v2 bound pair | `0x711F...ADa4` / `0x5D86...4026` | PASS |
| **Dynamic ID Handling** | Dynamic from receipt | Roadmaps 16 & 17, Grant 3 | PASS |
| **Reclaim MISSED Tranche** | 200 credits returned | 200 credits returned to funder | PASS |
| **Reclaim DELIVERED Refusal** | Refused with exact error | `tranche already released` | PASS |
| **Attacker Reclaim Refusal** | Refused with exact error | `not grant funder` | PASS |
| **Duplicate Reclaim Refusal** | Refused with exact error | `tranche already reclaimed` | PASS |
| **Credit Conservation** | Funder + Recipient + Escrow = 1000 | 300 + 700 + 0 = 1000 | PASS |
| **Error Mapping Count** | 59 templates | 59/59 1:1 bidirectional match | PASS |
| **Unit Test Suite** | 45 passed | 45 passed (4 test files) | PASS |
| **Playwright E2E Suite** | 14 passed | 14 passed (desktop & mobile) | PASS |
| **Axe-Core Violations** | 0 violations | 0 violations | PASS |
| **360px Horizontal Overflow**| None | 0px overflow | PASS |
| **Typography Base Font** | >= 18px | 18px (line-height 1.6) | PASS |
| **Banned Words Found** | 0 occurrences | 0 occurrences | PASS |
| **Visual Gradients Found** | 0 occurrences | 0 occurrences | PASS |
| **WCAG AA Contrast** | >= 4.5:1 | 5.10:1 to 15.33:1 | PASS |
