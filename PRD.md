# RouteBase: Product Requirements Document

## Project Goal
A multi-tenant Fintech SaaS platform providing merchants with automated storefronts, a tiered subscription model, and a 3% platform commission logic.

## Tech Stack
- **Backend:** Django Ninja (Python) - Port 8000
- **Frontend:** Next.js 15 (App Router) - Port 3000
- **Database:** PostgreSQL
- **Payments:** Safepay & Paymob (Split payout logic)

## Core Logic (The 12% Engine)
- **Total Customer Price:** 100%
- **Platform Fee:** 3% (Revenue for RouteBase)
- **Gateway Fee:** ~2.9% + 30 PKR (Safepay/Paymob)
- **Merchant Payout:** Total - (3% + Gateway Fee)

## Multi-Tenancy
- Merchants get a slug: `routebase.com/[merchant-slug]`
- Products and Orders are filtered by `merchant_id`.