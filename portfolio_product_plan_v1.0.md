# Portfolio Tracker — Product Plan v1.0
*Prepared: 10 March 2026*

---

## Background

John Daniells has built a personalised **investment portfolio tracker and retirement planner** using:
- **React JSX** front end (single-file component, ~76KB)
- **JSON** data files for prices and price history
- **Python scripts** for tooling
- Hosted on **GitHub Pages** as a static site
- Files stored in **Box** (`/Portfolio Tracker/`, folder ID `367938188655`)

The tracker (currently `portfolio_tracker_v1.21.jsx`) covers:
- 6 tabs: Dashboard, Accounts, Allocation, History, Goal, Retirement
- Full holdings tracking across John's SIPP, ISA, Workplace Pension and Elaine's SIPP, ISA
- Retirement drawdown modelling with DB pensions, state pensions, PCLS, tax optimisation
- Goal tracker projecting to £1.4m by Feb 2031 across bear/base/bull scenarios
- Price update workflow via Charles Stanley Direct, Yahoo Finance

---

## The Product Opportunity

The tracker has been built for John & Elaine specifically, but the underlying tool is genuinely valuable as a product. The question explored was: **how do we turn this into something we can sell?**

Three dimensions were considered:
1. **Parameterisation** — what needs to change in the tracker to make it work for any user
2. **Packaging** — how to distribute it
3. **Operating model** — what does the end user experience look like

---

## Chosen Model: Model C — AI-First Conversational Setup

### Why Model C

Rather than a download-and-configure template (Model A) or a traditional SaaS with forms (Model B), the chosen approach is an **AI-powered onboarding conversation** that:
- Asks the user questions in natural language
- Handles ambiguity gracefully (e.g. "I don't know my ISIN" → AI looks it up)
- Builds the personalised config invisibly in the background
- Produces a live, hosted, personalised tracker at the end

This is the most differentiated model and plays directly to Claude's strengths.

---

## End User Journey

```
User lands on product page → clicks "Build my tracker"
        ↓
Claude-powered chat onboarding (10 mins)
        ↓
Block 1: Identity & scope
  - Names, DOBs, couple or individual, country, retirement date, income target

Block 2: Accounts & holdings
  - Which accounts? (ISA/SIPP/GIA/Workplace Pension)
  - For each: provider, then holdings (fund name or ticker sufficient)
  - AI resolves ISINs/SEDOLs automatically

Block 3: Retirement inputs
  - DB pensions (employer, amount, start date)
  - State pension entitlement
  - Mortgage balance and planned PCLS usage

Block 4: Goals & scenarios
  - Target pot size, monthly contributions, risk appetite

Block 5: Review & generate
  - AI summarises, flags anomalies
  - Generates config JSON, deploys personalised tracker
  - User receives their URL: e.g. yourname.github.io/portfolio
```

---

## Technical Architecture

```
User browser
    ↓
Onboarding chat UI  ←→  Claude API (Anthropic)
    ↓
user_config.json generated
    ↓
Static site generator → GitHub Pages / Netlify (personalised URL)
    ↓
Portfolio tracker JSX (parameterised from config)
```

**Key principle:** The existing tracker JSX becomes the output format. The AI's job during onboarding is to populate a well-defined `user_config.json` schema. The tracker logic stays unchanged — only the data changes per user.

---

## What Needs to Be Built (MVP — ~2-3 weeks)

### 1. Parameterise the tracker (~2–3 days)
Externalise all hardcoded personal data from the JSX into a `user_config.json` schema:

- **Personal:** names, DOBs, retirement date, income target, tax parameters
- **Holdings:** all `INITIAL_DATA` accounts, holdings, ISINs, units, cost bases, purchase dates
- **Retirement config:** all `RETIREMENT_CONFIG` values (DB pensions, state pensions, mortgage, scenarios)
- **Goal parameters:** target, baseline, monthly contributions, required rate

The current architecture is already close — `INITIAL_DATA` and `RETIREMENT_CONFIG` are well-separated from the logic.

### 2. Build the onboarding chat (~3–4 days)
A Claude-powered React web app that:
- Conducts the interview in natural language
- Validates and resolves fund identifiers (ISIN/SEDOL lookup)
- Produces a validated `user_config.json`

### 3. Auto-deployment pipeline (~1–2 days)
- Takes a `user_config.json`
- Spins up a personalised GitHub Pages or Netlify site
- Returns the user's personal URL

### 4. Landing page + payments (~1 day)
- Lemon Squeezy or Stripe for checkout
- Simple landing page explaining the product

---

## Monetisation Options

| Model | Price | Notes |
|---|---|---|
| One-time setup fee | £49–99 | Generate & hand off, no ongoing commitment |
| Setup + annual refresh subscription | £29 setup + £4/month | Price update service |
| Setup + ongoing price updates | £8–12/month | Highest recurring value |
| IFA white-label (B2B) | £50–200/month per IFA | High value, adviser sends clients through onboarding |

**The recurring value hook** is price updates — the tracker is only useful with current prices, which is non-trivial for non-technical users. This is the natural subscription lever.

**The real differentiator** is the retirement modelling — integrated drawdown + DB pension + state pension + tax optimisation is genuinely IFA-adjacent and not well served by existing consumer tools.

---

## Next Steps (suggested priority)

1. Define the `user_config.json` schema — this is the foundation everything else depends on
2. Parameterise the existing tracker JSX to consume the config
3. Build and test the onboarding conversation flow
4. Build the deployment pipeline
5. Launch page + payment integration

---

## Files & References

| Item | Location |
|---|---|
| Portfolio tracker (current) | Box file ID `2150424610864` |
| Price history | Box file ID `2148943974580` |
| Briefing document | Box file ID `2148946057711` |
| Box folder | `/Portfolio Tracker/` — folder ID `367938188655` |
| Tracker version | v1.21 (as at 27 Feb 2026) |
| localStorage key | `portfolio-data-v25` |

---

*This document is a handoff briefing for continuation on another Claude account or session.*
