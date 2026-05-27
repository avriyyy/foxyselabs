# Dashboard Redesign — FoxyseLabs

Date: 2026-05-27
Status: Spec (approved)

---

## Overview

Complete redesign of the FoxyseLabs dashboard: from tab-based navigation to sidebar layout, with 7 pages covering the full arbitrage workflow. Backend rewrite with DexScreener API + subgraph verification for real-time multi-DEX price scanning.

---

## Architecture

### Frontend

```
src/pages/Dashboard.jsx          — layout shell + sidebar + routing
src/components/Sidebar.jsx       — collapsible sidebar navigation
src/components/dashboard/        — per-page components
  Overview.jsx
  Simulator.jsx
  History.jsx
  Alerts.jsx
  Analytics.jsx
  Wallets.jsx
  Settings.jsx
```

### Backend

```
server/
  index.js            — Express server (API routes + scheduler)
  prisma.js           — PrismaClient init (existing)
  scanner.js          — DexScreener fetcher + opportunity calculator
  verifier.js         — Subgraph/RPC verification layer
  routes/
    opportunities.js  — GET /api/opportunities, GET /api/opportunities/:id
    history.js        — GET /api/history
    alerts.js         — GET/POST/PUT/DELETE /api/alerts
    analytics.js      — GET /api/analytics
    wallets.js        — GET /api/wallets/:address
    dices.js          — GET /api/networks
  seed.js             — Admin wallet seed (existing)
```

### Data Pipeline

```
DexScreener API (setInterval 60s)
       ↓
  Scanner Service
       ↓
  Prisma Database
       ↓
  Express API → Frontend

  Verification (Subgraph / RPC) — triggered on opportunity found
```

---

## 1. Sidebar Navigation

### States

| State | Width | Content |
|-------|-------|---------|
| Expanded | 220px | Logo + "FoxyseLabs." + 7 nav items + collapse toggle |
| Collapsed | 60px | Logo only + expand toggle |

### Nav Items (ordered)

1. Overview — `IconScanEye`
2. Simulator — `IconChartColumn` (or `IconCalculator`)
3. History — `IconClock` (or `IconHistory`)
4. Alerts — `IconBell`
5. Analytics — `IconChartLine` (or `IconBarChart3`)
6. Wallets — `IconWallet`
7. Settings — `IconSettings`

### Active State

- Background: `#FF007F` (pink-neon)
- Text color: white
- Icon: white

### Inactive State

- Background: transparent
- Text: `on-surface-variant`
- Hover: `bg-white/5`

### Structure

```
+--sidebar--+  +--main content--+
| [Logo]     |  |                |
| FoxyseLabs.|  |  (page content)|
| ─────────── |  |                |
| ► Overview  |  |                |
| ■ Simulator |  |                |
| ■ History   |  |                |
| ■ Alerts    |  |                |
| ■ Analytics |  |                |
| ■ Wallets   |  |                |
| ■ Settings  |  |                |
| ─────────── |  |                |
| ◄ Collapse  |  |                |
+-------------+  +----------------+
```

### Mobile

- Sidebar hidden by default
- Hamburger menu in top navbar toggles overlay sidebar
- Same items, full-screen overlay style

### Implementation

- Icons from Lucide via existing `src/components/Icons.jsx` pattern
- Collapse state saved in localStorage for persistence
- Active page determined by URL search params (`?page=overview`)
- CSS transition `width 0.3s` for smooth collapse/expand

---

## 2. Overview Page

### Content

- **Filter bar** above table:
  - Dropdown: DEX filter (All / individual DEX)
  - Dropdown: Status filter (All / Live / Pro)
  - Input: Min profit ($)
  - "Reset" button
- **Opportunity table**: same columns as current (Pair, DEX A, DEX B, Diff, Profit, Status)
- **Row click** → opens slide-in detail panel:
  - Pair price comparison chart (simple bar)
  - Estimated profit breakdown (gross - gas - fees = net)
  - "Send to Simulator" button
  - "Create Alert" button
- **Footer**: auto-refresh indicator + "Scanning N DEX" badge (existing, keep)

### Data Source

- `GET /api/opportunities` — returns filtered list from DB
- Auto-refresh every 10s (polling) — user sees newest opportunities without manual reload
- New opportunities appear with a subtle highlight animation

---

## 3. Simulator Page

### Content

- **Left panel** — Input Parameters:
  - Trading Pair: dropdown auto-populated from Overview pairs
  - Capital Amount: numeric input
  - DEX A / DEX B: auto-filled if sent from Overview, else dropdown
  - "Simulate" button
- **Right panel** — Estimated Results:
  - Gross Profit / Gas Fee / DEX Fee / Slippage Cost / Net Profit / ROI
  - Same layout as current implementation

### "Send to Simulator" flow

- From Overview detail panel → click "Send to Simulator"
- Auto-switch to Simulator tab, pre-fill pair + DEX A/B
- Results calculated server-side via `POST /api/simulate`

---

## 4. History Page

### Content

- **Table columns**: Timestamp, Pair, DEX A, DEX B, Diff (%), Est. Profit, Actual Profit, Status
- Status values: `executed` (green), `missed` (red), `alerted` (pink)
- **Filter bar**: date range picker, status dropdown, pair search, DEX filter
- **Search**: text input — filter by pair name
- **Export CSV** button — visible for Pro/Elite only

### Data Source

- `GET /api/history` — paginated, filterable
- Pagination: 50 rows per page, "Load More" button

---

## 5. Alerts Page

### Content

- **Alert list**: cards with:
  - Pair name + DEX filter tag
  - Target Diff % + Min Profit $
  - Toggle ON/OFF switch
  - Notification type badge (In-App / Email / Both)
  - Edit / Delete buttons
- **"Create Alert" button** — opens modal with form:
  - Pair (dropdown)
  - Min Diff % (number)
  - Min Profit $ (number)
  - DEX filter (multi-select checkboxes)
  - Auto-Execute toggle (only for Pro/Elite)
  - Notification type (In-App only for Free, In-App + Email for Pro+)
  - Save / Cancel

### Data Source

- `GET /api/alerts` — user's alerts
- `POST /api/alerts` — create
- `PUT /api/alerts/:id` — update
- `DELETE /api/alerts/:id` — delete

### Auto-Execute

- Pro/Elite only
- When alert triggers AND auto-execute is ON:
  - Verifier checks if opportunity is still valid
  - Executes via wallet's connected DEX (future feature — v2)

---

## 6. Analytics Page

### Content

- **4 stat cards**: Total Opportunities, Success Rate, Total Profit (all time), Best Trade (single)
- **Chart row**: Profit trend (line chart, 7d/30d/90d toggle) + Opportunity frequency (bar chart by DEX)
- **Bottom row**: Top 5 performing pairs table + DEX comparison table
- **Filter bar**: date range, DEX, pair

### Data Source

- `GET /api/analytics?period=7d&dex=&pair=`
- Returns: stats summary, chart data points, top pairs, DEX comparison

### Charts

- Use a lightweight chart library (e.g., Chart.js or recharts)
- Dark theme to match existing design
- Interactive tooltips on hover

---

## 7. Wallets Page

### Content

- **Current wallet card**:
  - Address (full, copyable)
  - Role badge (Free / Pro / Elite / Admin)
  - Connected network
  - Balance (ETH/SOL/AVAX/MATIC per network)
- **Multi-wallet section** (Elite only):
  - List of connected wallets
  - "Add Wallet" button
  - Remove wallet
- **Activity log**: recent transactions from this wallet
  - Timestamp, action, pair, profit, status

### Data Source

- `GET /api/wallets/:address` — wallet details + balance
- `GET /api/wallets/:address/activity` — recent activity

---

## 8. Settings Page

### Content

- **DEX Preferences**: checkboxes to enable/disable specific DEXes
- **Slippage Tolerance** default: number input (%)
- **Gas Threshold**: max gas fee willing to pay ($)
- **Min Profit Threshold**: minimum profit to show in Overview ($)
- **Notification Preferences**: email toggle, in-app toggle
- **Auto-Execute Defaults**: (Pro/Elite only) default ON/OFF, max trade size

### Data Source

- `GET /api/settings` — user settings
- `PUT /api/settings` — update
- Stored in DB per wallet address

---

## Backend Architecture

### Database Schema (Prisma)

```prisma
model Wallet {
  id        Int      @id @default(autoincrement())
  address   String   @unique
  role      String   @default("Free")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PriceSnapshot {
  id        Int      @id @default(autoincrement())
  dex       String
  network   String
  pair      String
  price     Float
  liquidity Float
  volume24h Float
  timestamp DateTime @default(now())

  @@index([dex, pair, timestamp])
}

model Opportunity {
  id        Int      @id @default(autoincrement())
  pair      String
  dexA      String
  dexB      String
  priceA    Float
  priceB    Float
  diff      Float
  profit    Float
  gas       Float
  slippage  Float
  status    String   @default("pending") // pending, verified, invalid, executed
  verifiedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status, createdAt])
}

model Alert {
  id           Int      @id @default(autoincrement())
  walletId     Int
  pair         String
  minDiff      Float
  minProfit    Float
  dexFilter    String   // JSON array or "all"
  autoExecute  Boolean  @default(false)
  notification String   @default("in-app") // in-app, email, both
  enabled      Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([walletId, enabled])
}

model Execution {
  id            Int      @id @default(autoincrement())
  opportunityId Int
  walletId      Int
  pair          String
  dexA          String
  dexB          String
  amount        Float
  estProfit     Float
  actualProfit  Float?
  status        String   // pending, executed, failed
  txHash        String?
  executedAt    DateTime?
  createdAt     DateTime @default(now())
}

model AnalyticsDaily {
  id              Int      @id @default(autoincrement())
  date            DateTime
  opportunities   Int
  executed        Int
  totalProfit     Float
  successRate     Float
  dexStats        String   // JSON

  @@unique([date])
}

model Setting {
  id        Int    @id @default(autoincrement())
  walletId  Int    @unique
  dexFilter String  @default("all")  // JSON array
  slippage  Float   @default(0.5)
  gasLimit  Float   @default(5.0)
  minProfit Float   @default(0.0)
  notify    String  @default("both") // in-app, email, both, none
  updatedAt DateTime @updatedAt
}
```

### Scanner Service

```javascript
// server/scanner.js — runs every 60s

async function scanOpportunities() {
  // 1. Fetch top pairs by liquidity from DexScreener per DEX
  const DEXES = [
    { name: "Uniswap",   network: "ethereum", chainId: 1 },
    { name: "PancakeSwap", network: "bsc",     chainId: 56 },
    { name: "Raydium",   network: "solana",   chainId: 101 },
    { name: "Orca",      network: "solana",   chainId: 101 },
    { name: "Trader Joe", network: "avalanche", chainId: 43114 },
    { name: "QuickSwap", network: "polygon",  chainId: 137 },
    { name: "Curve",     network: "ethereum", chainId: 1 },
    { name: "Balancer",  network: "ethereum", chainId: 1 },
  ]

  for (const dex of DEXES) {
    const data = await fetchDexScreener(dex)
    // data: array of { pair, price, liquidity, volume24h }
    // Store snapshots and calculate cross-DEX opportunities
  }

  // 2. Find matching pairs across DEXes
  //    Group by pair name → calculate price diff → sort by diff

  // 3. Store high-diff opportunities (above min threshold)

  // 4. For verified (Pro/Elite) opportunities: verify via subgraph

  // 5. Check alerts — notify if any opportunity matches alert criteria
}
```

### DexScreener API

Endpoint: `https://api.dexscreener.com/latest/dex/search/?q=`

Used to fetch top 100 pairs by liquidity per DEX. DexScreener returns pairs sorted by liquidity by default.

Rate limiting: ~300 req/min (free tier). With 8 DEXes every 60s, we use ~8 req/min — well within limits.

### Tier Differences

| Feature | Free | Pro | Elite |
|---------|------|-----|-------|
| Opportunities shown | Live only (raw prices) | Live + Verified | Live + Verified + Priority |
| Max pairs scanned | Top 50 per DEX | Top 100 per DEX | Top 200 per DEX |
| Verification | None | Subgraph verified | Subgraph + RPC verified |
| History retention | 7 days | 30 days | 90 days |
| Auto-execute | ❌ | ON/OFF toggle | Highest priority |
| Alerts | 3 max | Unlimited | Unlimited |
| Export CSV | ❌ | ✅ | ✅ |

### Verification (Subgraph)

For Pro/Elite tier opportunities: fetch price from the DEX's subgraph to confirm the diff is still valid before showing as "verified".

### Supported Networks & DEXes

| DEX | Network | DexScreener Support | Subgraph Available |
|-----|---------|---------------------|--------------------|
| Uniswap V3 | Ethereum | Yes | Yes |
| PancakeSwap | BSC | Yes | Yes |
| Raydium | Solana | Yes | Yes |
| Orca | Solana | Yes | Yes |
| Trader Joe | Avalanche | Yes | Yes |
| QuickSwap | Polygon | Yes | Yes |
| Curve | Ethereum | Yes | Yes |
| Balancer | Ethereum | Yes | Yes |

---

## Frontend Implementation Notes

- All new components go in `src/components/dashboard/`
- Sidebar extracted to `src/components/Sidebar.jsx`
- Dashboard.jsx becomes a shell: Sidebar + routing logic
- Page content swapped via URL search params (`?page=...`) — same pattern as current tabs
- Lucide icons imported from `src/components/Icons.jsx` (existing pattern)
- Animation for new opportunities: CSS keyframe pulse on row appear
- Chart library: `recharts` (lightweight, React-native, dark theme support)

---

## API Endpoints (Complete List)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/wallet/:address | Get/auto-create wallet, return role |
| POST | /api/wallet | Upsert wallet |
| GET | /api/opportunities | List opportunities (filtered) |
| GET | /api/opportunities/:id | Single opportunity detail |
| POST | /api/simulate | Run simulation with given params |
| GET | /api/history | Paginated history log |
| GET | /api/alerts | User's alerts |
| POST | /api/alerts | Create alert |
| PUT | /api/alerts/:id | Update alert |
| DELETE | /api/alerts/:id | Delete alert |
| GET | /api/analytics | Aggregated statistics |
| GET | /api/wallets/:address/activity | Wallet activity log |
| GET | /api/settings | User settings |
| PUT | /api/settings | Update settings |
| GET | /api/networks | Supported DEXes/networks |

---

## Security & Rate Limiting

- DexScreener API key not required for basic usage
- Prisma connection pooled for efficiency
- API routes validate wallet address format
- Alert checking runs in-memory, not per-request
- Scanner errors logged but don't crash the service
- Rate limiting on API routes: 100 req/min per IP (express-rate-limit)

---

## Scope for First Implementation

Phase 1 (MVP):
- Sidebar navigation (expand/collapse)
- Overview page with real DexScreener data
- Simulator page (existing, enhanced)
- History page (table + filters, no CSV export)
- Settings page (basic preferences)

Phase 2 (Next):
- Alerts page
- Analytics page (charts)
- Multi-wallet support
- Auto-execute
- CSV export
- Email notifications

---

## Open Questions (Resolved)

- Backend approach: Express + Prisma ✅
- Data source: DexScreener + subgraph verification ✅
- Scan interval: 60 seconds ✅
- Pair strategy: Top by liquidity ✅
- Networks: Ethereum, BSC, Solana, Avalanche, Polygon ✅
- Navigation: Collapsible sidebar with 7 items ✅
- Active state: Pink background (#FF007F) ✅
