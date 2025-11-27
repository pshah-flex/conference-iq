# Development Plan: Conference IQ (V1.3)

**Based on PRD V1.3**  
**Tech Stack: Next.js (Vercel) + Supabase**

---

## Table of Contents

1. [Phase 0: Project Setup & Infrastructure](#phase-0-project-setup--infrastructure)
2. [Phase 1: Database Schema & Migrations](#phase-1-database-schema--migrations)
3. [Phase 2: Core Data Models & Repositories](#phase-2-core-data-models--repositories)
4. [Phase 3: API Endpoints](#phase-3-api-endpoints)
5. [Phase 4: Web Crawling Agent](#phase-4-web-crawling-agent)
6. [Phase 5: Frontend - Conference Directory](#phase-5-frontend---conference-directory)
7. [Phase 6: Frontend - Conference Detail Pages](#phase-6-frontend---conference-detail-pages)
8. [Phase 7: Speaker Intelligence Features](#phase-7-speaker-intelligence-features)
9. [Phase 8: Company Search & Intelligence](#phase-8-company-search--intelligence)
10. [Phase 9: Bookmarking System](#phase-9-bookmarking-system)
11. [Phase 10: Admin Interface](#phase-10-admin-interface)
12. [Phase 11: Testing & Deployment](#phase-11-testing--deployment)
13. [Phase 12: Authentication & Stripe Billing](#phase-12-authentication--stripe-billing)

**Note:** This plan reflects the simplified MVP scope. Post-MVP features are documented in `BACKLOG.md`.

---

## Phase 0: Project Setup & Infrastructure

### Tasks

1. **Initialize Next.js Project**
   - [x] Create Next.js 14+ app with TypeScript
   - [x] Configure Tailwind CSS
   - [x] Set up project structure (`app/`, `lib/`, `components/`, `types/`)
   - [x] Configure ESLint and Prettier

2. **Supabase Setup**
   - [x] Create Supabase project *(Project ID: lhhwnvknimltwxaqwowb, Region: us-east-1)*
   - [x] Install Supabase client libraries (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`)
   - [x] Configure environment variables (`.env.local`) *(Service role key needs to be added manually from dashboard)*
   - [x] Set up Supabase client utilities (`lib/supabase.ts`)
   - [x] Set up Supabase Auth helpers for Next.js

3. **Authentication Setup (Basic)**
   - [x] Configure Supabase Auth (email/password, OAuth providers optional)
   - [x] Create auth context/provider (`app/contexts/AuthContext.tsx`)
   - [x] Set up protected route middleware
   - [x] Create login/signup pages (`app/auth/login/page.tsx`, `app/auth/signup/page.tsx`)
   - [x] Create user profile page (`app/profile/page.tsx`)
   - [ ] Add user roles system (user, admin) in Supabase *(Will be done in Phase 1 with RLS policies)*

4. **Vercel Configuration**
   - [x] Configure `vercel.json` for routing
   - [ ] Set up environment variables in Vercel dashboard *(Manual step - requires Supabase project)*
   - [x] Configure build settings

5. **Project Dependencies**
   - [x] Install core dependencies:
     - `next`, `react`, `react-dom`
     - `@supabase/supabase-js`
     - `@supabase/auth-helpers-nextjs`
     - `tailwindcss`, `autoprefixer`, `postcss`
     - `typescript`, `@types/node`, `@types/react`
   - [ ] Install agent dependencies: *(Deferred to Phase 4)*
     - `puppeteer` or `playwright` (web crawling)
     - `cheerio` (HTML parsing)
     - `pdf-parse` (PDF extraction)
     - `nodemailer` or `resend` (email)
   - [x] Install utility libraries:
     - `date-fns` (date handling)
     - `zod` (validation)
     - `lucide-react` (icons)

6. **Type Definitions**
   - [x] Create `types/index.ts` with core types:
     - `Conference`, `Speaker`, `Exhibitor`
     - `CompanyIntelligence`, `Bookmark`
     - API response types

**Estimated Time:** 8-10 hours  
**Dependencies:** None

**Status:** ✅ Code complete - Manual steps remaining:
- Create Supabase project at https://supabase.com
- Copy `.env.local.example` to `.env.local` and add Supabase credentials
- Add environment variables to Vercel dashboard
- User roles will be configured in Phase 1 with database schema

---

## Phase 1: Database Schema & Migrations

### Tasks

1. **Core Tables**
   - [ ] Create `conferences` table
     - id (uuid, primary key)
     - name (text)
     - url (text, unique)
     - start_date (date)
     - end_date (date)
     - city (text)
     - country (text)
     - industry (text[])
     - attendance_estimate (integer)
     - agenda_url (text)
     - pricing_url (text)
     - organizer_name (text)
     - organizer_email (text)
     - organizer_phone (text)
     - fields_populated_count (integer, number of populated fields)
     - total_fields_count (integer, total expected fields)
     - last_crawled_at (timestamp)
     - last_verified_at (timestamp)
     - created_at (timestamp)
     - updated_at (timestamp)

   - [ ] Create `speakers` table
     - id (uuid, primary key)
     - conference_id (uuid, foreign key → conferences)
     - name (text)
     - title (text)
     - company (text)
     - company_industry (text, nullable - manual override only)
     - company_size_bucket (text: 'startup', 'mid', 'enterprise', 'unknown', nullable - manual override only)
     - source_url (text)
     - created_at (timestamp)
     - updated_at (timestamp)

   - [ ] Create `exhibitors` table
     - id (uuid, primary key)
     - conference_id (uuid, foreign key → conferences)
     - company_name (text)
     - exhibitor_tier_raw (text)
     - exhibitor_tier_normalized (text: 'platinum', 'gold', 'silver', 'bronze', 'standard', 'unknown', nullable)
     - estimated_cost (numeric, nullable - only explicit costs, no estimates)
     - source_url (text)
     - created_at (timestamp)
     - updated_at (timestamp)

   - [ ] Create `bookmarks` table
     - id (uuid, primary key)
     - user_id (uuid, foreign key → auth.users)
     - conference_id (uuid, foreign key → conferences)
     - created_at (timestamp)
     - UNIQUE(user_id, conference_id)

   - [ ] Create `crawl_logs` table
     - id (uuid, primary key)
     - conference_id (uuid, foreign key → conferences)
     - status (text: 'success', 'failed', 'partial')
     - data_extracted (jsonb)
     - error_message (text)
     - crawled_at (timestamp)


2. **Indexes & Views**
   - [ ] Create indexes:
     - `conferences(url)` (unique)
     - `conferences(industry)`
     - `conferences(start_date)`
     - `speakers(conference_id)`
     - `speakers(company)`
     - `exhibitors(conference_id)`
     - `exhibitors(company_name)`
     - `bookmarks(user_id, conference_id)`

   - [ ] **Note:** Company intelligence will use simple SQL queries instead of materialized views for MVP. Views can be added later if performance becomes an issue.

3. **Row-Level Security (RLS)**
   - [ ] Enable RLS on all tables
   - [ ] Create policies:
     - `conferences`: public read, admin write
     - `speakers`: public read, admin write
     - `exhibitors`: public read, admin write
     - `bookmarks`: users can read/write their own
     - `crawl_logs`: admin only

4. **Storage Buckets**
   - [ ] Create `raw-html` bucket (public read, admin write)
   - [ ] Create `pdfs` bucket (public read, admin write)

**Estimated Time:** 4-6 hours  
**Dependencies:** Phase 0

---

## Phase 2: Core Data Models & Repositories

### Tasks

1. **Repository Pattern Setup**
   - [ ] Create `lib/repositories/base.repository.ts` (base class)
   - [ ] Create repository interfaces in `lib/repositories/types.ts`

2. **Conference Repository**
   - [ ] `lib/repositories/conferences.repository.ts`
     - `findAll(filters, pagination)`
     - `findById(id)`
     - `findByUrl(url)`
     - `create(data)`
     - `update(id, data)`
     - `updateCompletenessCount(id)` (simple field count)
     - `search(query, filters)`

3. **Speaker Repository**
   - [ ] `lib/repositories/speakers.repository.ts`
     - `findByConferenceId(conferenceId)`
     - `findByCompany(companyName)`
     - `createMany(speakers[])`
     - `getCompanyStats(conferenceId)` (group by company, count per company)

4. **Exhibitor Repository**
   - [ ] `lib/repositories/exhibitors.repository.ts`
     - `findByConferenceId(conferenceId)`
     - `findByCompany(companyName)`
     - `createMany(exhibitors[])`
     - `getTierDistribution(conferenceId)` (simple tier counts)

5. **Company Intelligence Repository**
   - [ ] `lib/repositories/company-intelligence.repository.ts`
     - `searchCompanies(query)`
     - `getExhibitorHistory(companyName)`
     - `getSpeakerHistory(companyName)`
     - `getEstimatedSpend(companyName)` (sum of explicit costs only, no estimates)
     - `getFullProfile(companyName)`

6. **Bookmark Repository**
   - [ ] `lib/repositories/bookmarks.repository.ts`
     - `findByUserId(userId)`
     - `create(userId, conferenceId)`
     - `delete(userId, conferenceId)`
     - `isBookmarked(userId, conferenceId)`

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 1

---

## Phase 3: API Endpoints

### Tasks

1. **Conference Endpoints**
   - [ ] `app/api/conferences/route.ts`
     - `GET /api/conferences` (list with filters, pagination)
     - `POST /api/conferences` (admin only, create)
   
   - [ ] `app/api/conferences/[id]/route.ts`
     - `GET /api/conferences/[id]` (get by id)
     - `PATCH /api/conferences/[id]` (admin only, update)
     - `DELETE /api/conferences/[id]` (admin only, delete)

   - [ ] `app/api/conferences/search/route.ts`
     - `GET /api/conferences/search?q=...` (search)

2. **Speaker Endpoints**
   - [ ] `app/api/conferences/[id]/speakers/route.ts`
     - `GET /api/conferences/[id]/speakers` (get speakers for conference)

   - [ ] `app/api/speakers/companies/route.ts`
     - `GET /api/speakers/companies?conferenceId=...` (get company stats)

3. **Exhibitor Endpoints**
   - [ ] `app/api/conferences/[id]/exhibitors/route.ts`
     - `GET /api/conferences/[id]/exhibitors` (get exhibitors for conference)

4. **Company Intelligence Endpoints**
   - [ ] `app/api/companies/search/route.ts`
     - `GET /api/companies/search?q=...` (search companies)

   - [ ] `app/api/companies/[companyName]/exhibitors/route.ts`
     - `GET /api/companies/[companyName]/exhibitors` (exhibitor history)

   - [ ] `app/api/companies/[companyName]/speakers/route.ts`
     - `GET /api/companies/[companyName]/speakers` (speaker history)

   - [ ] `app/api/companies/[companyName]/profile/route.ts`
     - `GET /api/companies/[companyName]/profile` (full intelligence profile)

5. **Bookmark Endpoints**
   - [ ] `app/api/bookmarks/route.ts`
     - `GET /api/bookmarks` (user's bookmarks)
     - `POST /api/bookmarks` (create bookmark)

   - [ ] `app/api/bookmarks/[conferenceId]/route.ts`
     - `DELETE /api/bookmarks/[conferenceId]` (remove bookmark)

6. **Admin Endpoints**
   - [ ] `app/api/admin/crawl/route.ts`
     - `POST /api/admin/crawl` (trigger crawl for URL)

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 2

---

## Phase 4: Web Crawling Agent

### Tasks

1. **Crawler Core**
   - [ ] `lib/services/crawler/base-crawler.ts` (base class)
   - [ ] `lib/services/crawler/conference-crawler.ts` (main crawler)
   - [ ] Configure Puppeteer/Playwright with ethical settings
   - [ ] Implement robots.txt checking

2. **Data Extraction Modules**
   - [ ] `lib/services/crawler/extractors/basic-info.ts`
     - Extract name, dates, location, URL
   
   - [ ] `lib/services/crawler/extractors/speakers.ts`
     - Extract speaker list (name, title, company)
     - Use pattern matching for parsing
     - Store company name as-is (no enrichment)
   
   - [ ] `lib/services/crawler/extractors/exhibitors.ts`
     - Extract exhibitor list
     - Extract tier information if explicitly stated
     - Parse explicit costs only ("Gold Sponsor - $25,000")
   
   - [ ] `lib/services/crawler/extractors/pricing.ts`
     - Extract ticket pricing (if easily accessible)
     - Extract sponsor tier pricing (explicit costs only)
     - Basic PDF parsing for pricing docs (if straightforward)
   
   - [ ] `lib/services/crawler/extractors/contact.ts`
     - Extract organizer contact information
     - Extract agenda URL (store URL only, don't parse content)

3. **Simplified Spend Extraction**
   - [ ] `lib/services/spend-extraction.ts` (simplified, no estimation)
     - Parse explicit tier costs ("Gold Sponsor - $25,000")
     - Extract from PDF pricing documents (if easily parseable)
     - Mark as "Unknown" if cost not explicitly stated
     - **No tier inference, no industry averages, no cost ranges**

4. **Crawler Service Integration**
   - [ ] `lib/services/crawler-service.ts`
     - Orchestrate full crawl process
     - Save raw HTML to Supabase Storage (optional)
     - Save PDFs to Supabase Storage (optional)
     - Update conference records
     - Create speakers and exhibitors records
     - Calculate simple field count for completeness
     - Log crawl results

5. **Cron Job / Background Task**
   - [ ] `app/api/cron/crawl/route.ts` (Vercel cron or Supabase Edge Function)
   - Schedule periodic crawls
   - Handle queue of URLs to crawl

**Estimated Time:** 12-15 hours  
**Dependencies:** Phase 1, Phase 2

---

## Phase 5: Frontend - Conference Directory

### Tasks

1. **Layout & Navigation**
   - [ ] `app/components/layout/Navbar.tsx`
   - [ ] `app/components/layout/Layout.tsx`
   - [ ] Set up routing structure

2. **Conference List Page**
   - [ ] `app/conferences/page.tsx`
     - Display paginated conference list
     - Search functionality
     - Filter by industry, date range, location
     - Sort by date, name, completeness
     - Display key info: name, dates, location, simple completeness indicator

3. **Search & Filters Component**
   - [ ] `app/components/ConferenceFilters.tsx`
     - Search input
     - Industry multi-select
     - Date range picker
     - Location filter
     - Clear filters button

4. **Conference Card Component**
   - [ ] `app/components/ConferenceCard.tsx`
     - Display conference preview
     - Link to detail page
     - Show bookmark button
     - Show simple data completeness indicator (X of Y fields)

5. **Pagination Component**
   - [ ] `app/components/Pagination.tsx`
     - Handle page navigation
     - Display page numbers

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 3

---

## Phase 6: Frontend - Conference Detail Pages

### Tasks

1. **Conference Detail Page**
   - [ ] `app/conferences/[id]/page.tsx`
     - Display full conference information
     - Show all data fields from PRD
     - Bookmark button
     - Share functionality

2. **Detail Page Sections**
   - [ ] `app/components/conferences/BasicInfo.tsx` (dates, location, attendance)
   - [ ] `app/components/conferences/ExhibitorList.tsx` (simple list, no competitor tags)
   - [ ] `app/components/conferences/SpeakerList.tsx` (with basic company grouping)
   - [ ] `app/components/conferences/PricingInfo.tsx` (explicit costs only, show "Unknown" if not available)
   - [ ] `app/components/conferences/Agenda.tsx` (link to agenda URL if available)
   - [ ] `app/components/conferences/ContactInfo.tsx`
   - [ ] `app/components/conferences/DataCompleteness.tsx` (simple field count: "X of Y fields populated", last crawled date)

3. **Basic Speaker Company Stats**
   - [ ] `app/components/conferences/SpeakerCompanyStats.tsx`
     - Group speakers by company
     - Show speaker count per company
     - Simple list display (no charts, no industry distribution, no seniority analysis)

**Estimated Time:** 10-12 hours  
**Dependencies:** Phase 3, Phase 5

---

## Phase 7: Speaker Intelligence Features

### Tasks

1. **Speaker List Enhancements**
   - [ ] Enhance `SpeakerList.tsx` with company grouping
   - [ ] Add filters: by company, by title, by industry
   - [ ] Add sorting options

2. **Company Speaker Stats**
   - [ ] `app/components/speakers/CompanySpeakerStats.tsx`
     - Display company distribution
     - Show speaker count per company
     - Visualize with charts (recharts or similar)

3. **Seniority Pattern Analysis**
   - [ ] `app/components/speakers/SeniorityPatterns.tsx`
     - Categorize titles (C-suite, VP, Director, IC, etc.)
     - Display distribution
     - Identify patterns (VP-heavy, IC-heavy, etc.)

4. **Industry Distribution**
   - [ ] `app/components/speakers/IndustryDistribution.tsx`
     - Show industries represented by speakers
     - Visualize distribution

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 7

---

## Phase 8: Company Search & Intelligence

### Tasks

1. **Company Search Page**
   - [ ] `app/companies/page.tsx`
     - Search input
     - Display search results
     - Link to company profile

2. **Company Profile Page**
   - [ ] `app/companies/[companyName]/page.tsx`
     - Display full company intelligence profile
     - Show exhibitor history
     - Show speaker history
     - Show estimated spend

3. **Company Profile Components**
   - [ ] `app/components/companies/ExhibitorHistory.tsx`
     - List conferences where company exhibited
     - Show tier and explicit cost per conference (if known)
     - Show total spend (sum of explicit costs only, no estimates)
     - Show "Unknown" for conferences without explicit pricing
   
   - [ ] `app/components/companies/SpeakerHistory.tsx`
     - List conferences where company had speakers
     - Show speaker count per conference
     - Simple list display

3. **Spend Display (Simplified)**
   - [ ] Display known costs only
   - [ ] Show "Unknown" for conferences without explicit pricing
   - [ ] Display disclaimer: "Only explicit costs shown, estimates not included"

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 3, Phase 4

---

## Phase 9: Bookmarking System

### Tasks

1. **Bookmark Integration with Auth**
   - [ ] Use existing authentication from Phase 0
   - [ ] Protect bookmark routes (require authentication)
   - [ ] Add user context to bookmark operations

2. **Bookmark UI Components**
   - [ ] `app/components/BookmarkButton.tsx` (toggle bookmark)
   - [ ] `app/components/BookmarkIcon.tsx` (bookmark icon with state)

3. **Bookmarks Page**
   - [ ] `app/bookmarks/page.tsx`
     - Display user's bookmarked conferences
     - Same filtering/sorting as main directory

4. **Bookmark Integration**
   - [ ] Add bookmark buttons to conference cards
   - [ ] Add bookmark button to detail pages
   - [ ] Show bookmark count (optional)

**Estimated Time:** 4-6 hours  
**Dependencies:** Phase 0 (Auth), Phase 1, Phase 3, Phase 5

---

## Phase 10: Admin Interface

### Tasks

1. **Admin Authentication**
   - [ ] Create admin role check
   - [ ] Protect admin routes
   - [ ] Create admin layout

2. **Basic Conference Management**
   - [ ] `app/admin/conferences/page.tsx`
     - List all conferences (simple table)
     - Create new conference (manual entry form)
     - Edit conference data
     - Delete conferences
     - Basic search/filter

3. **Crawl Management (Basic)**
   - [ ] `app/admin/crawl/page.tsx`
     - Manual crawl trigger (single URL input)
     - View crawl logs (simple list, recent first)
     - Basic error display

**Note:** Advanced admin features (dashboard stats, email outreach, bulk operations, data quality tools) deferred to post-MVP. See `BACKLOG.md`.

**Estimated Time:** 6-8 hours  
**Dependencies:** Phase 3, Phase 4

---

## Phase 11: Testing & Deployment

### Tasks

1. **Unit Tests**
   - [ ] Test repositories
   - [ ] Test services (crawler, spend extraction)
   - [ ] Test utility functions

2. **Integration Tests**
   - [ ] Test API endpoints
   - [ ] Test database operations
   - [ ] Test authentication flows

3. **E2E Tests (Optional)**
   - [ ] Test key user flows
   - [ ] Test admin flows

4. **Performance Optimization**
   - [ ] Optimize database queries
   - [ ] Add caching where appropriate
   - [ ] Optimize images/assets
   - [ ] Test pagination performance

5. **Error Handling**
   - [ ] Add error boundaries
   - [ ] Add error logging (Sentry or similar)
   - [ ] Handle API errors gracefully
   - [ ] Add user-friendly error messages

6. **Documentation**
   - [ ] API documentation
   - [ ] Database schema documentation
   - [ ] Deployment guide
   - [ ] Admin user guide

7. **Deployment**
   - [ ] Final Vercel configuration
   - [ ] Environment variables setup
   - [ ] Database migrations in production
   - [ ] Initial data seeding (if needed)
   - [ ] Domain configuration
   - [ ] SSL/HTTPS verification

8. **Monitoring & Logging**
   - [ ] Set up error tracking
   - [ ] Set up analytics (optional)
   - [ ] Monitor crawl success rates
   - [ ] Monitor API performance

**Estimated Time:** 12-15 hours  
**Dependencies:** All previous phases

---

## Phase 12: Authentication & Stripe Billing

### Tasks

1. **Enhanced Authentication**
   - [ ] Review and enhance existing auth from Phase 0
   - [ ] Add email verification flow
   - [ ] Add password reset flow
   - [ ] Add OAuth providers (Google, GitHub) - optional
   - [ ] Add session management and refresh tokens
   - [ ] Add user onboarding flow

2. **Stripe Setup**
   - [ ] Create Stripe account and get API keys
   - [ ] Install Stripe libraries (`stripe`, `@stripe/stripe-js`)
   - [ ] Set up Stripe webhook endpoint (`app/api/webhooks/stripe/route.ts`)
   - [ ] Configure Stripe products and prices in dashboard
   - [ ] Set up test and production environments

3. **Subscription Plans**
   - [ ] Define subscription tiers (e.g., Free, Pro, Enterprise)
   - [ ] Create products and prices in Stripe
   - [ ] Design pricing page (`app/pricing/page.tsx`)
   - [ ] Create subscription management UI

4. **Database Schema for Billing**
   - [ ] Create `subscriptions` table:
     - id (uuid, primary key)
     - user_id (uuid, foreign key → auth.users)
     - stripe_customer_id (text)
     - stripe_subscription_id (text)
     - stripe_price_id (text)
     - status (text: 'active', 'canceled', 'past_due', etc.)
     - current_period_start (timestamp)
     - current_period_end (timestamp)
     - cancel_at_period_end (boolean)
     - created_at (timestamp)
     - updated_at (timestamp)
   
   - [ ] Create `subscription_usage` table (for usage tracking):
     - id (uuid, primary key)
     - user_id (uuid, foreign key → auth.users)
     - feature (text: 'conference_views', 'company_searches', etc.)
     - usage_count (integer)
     - period_start (timestamp)
     - period_end (timestamp)
     - created_at (timestamp)

   - [ ] Add `subscription_tier` column to `users` table or user metadata
   - [ ] Create indexes on subscription tables

5. **Stripe Integration Services**
   - [ ] `lib/services/stripe-service.ts`:
     - `createCustomer(userId, email)`
     - `createSubscription(customerId, priceId)`
     - `cancelSubscription(subscriptionId)`
     - `updateSubscription(subscriptionId, newPriceId)`
     - `getSubscription(subscriptionId)`
     - `handleWebhook(event)`
   
   - [ ] `lib/services/subscription-service.ts`:
     - `getUserSubscription(userId)`
     - `checkFeatureAccess(userId, feature)`
     - `incrementUsage(userId, feature)`
     - `getUsageStats(userId, period)`

6. **Billing API Endpoints**
   - [ ] `app/api/billing/create-checkout/route.ts`
     - `POST /api/billing/create-checkout` (create Stripe checkout session)
   
   - [ ] `app/api/billing/create-portal/route.ts`
     - `POST /api/billing/create-portal` (create customer portal session)
   
   - [ ] `app/api/billing/subscription/route.ts`
     - `GET /api/billing/subscription` (get user's subscription)
     - `POST /api/billing/subscription` (create subscription)
     - `DELETE /api/billing/subscription` (cancel subscription)
   
   - [ ] `app/api/webhooks/stripe/route.ts`
     - `POST /api/webhooks/stripe` (handle Stripe webhooks)
     - Handle events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

7. **Frontend Billing Pages**
   - [ ] `app/pricing/page.tsx` (pricing page with plan comparison)
   - [ ] `app/billing/page.tsx` (billing dashboard):
     - Current subscription status
     - Usage statistics
     - Payment method management
     - Invoice history
     - Upgrade/downgrade options
   
   - [ ] `app/billing/success/page.tsx` (checkout success page)
   - [ ] `app/billing/cancel/page.tsx` (checkout cancel page)

8. **Feature Gating**
   - [ ] Create `lib/middleware/feature-gate.ts` (middleware for feature access)
   - [ ] Implement feature gates:
     - Free tier: Limited conference views, basic search
     - Pro tier: Unlimited views, company intelligence, advanced filters
     - Enterprise tier: API access, bulk exports, custom features
   - [ ] Add feature gate checks to API endpoints
   - [ ] Add upgrade prompts in UI when limits reached

9. **Usage Tracking**
   - [ ] Track feature usage (conference views, company searches, etc.)
   - [ ] Display usage in billing dashboard
   - [ ] Show usage limits based on subscription tier
   - [ ] Implement rate limiting for API endpoints

10. **Subscription Management UI Components**
    - [ ] `app/components/billing/SubscriptionCard.tsx` (current subscription display)
    - [ ] `app/components/billing/UsageStats.tsx` (usage statistics)
    - [ ] `app/components/billing/UpgradePrompt.tsx` (upgrade CTA)
    - [ ] `app/components/billing/PlanComparison.tsx` (plan comparison table)

11. **Email Notifications (Billing)**
    - [ ] Set up email templates for:
      - Subscription confirmation
      - Payment success
      - Payment failure
      - Subscription cancellation
      - Usage limit warnings
    - [ ] Integrate with email service (Resend)

12. **Testing & Security**
    - [ ] Test subscription flows (test mode)
    - [ ] Test webhook handling
    - [ ] Test feature gating
    - [ ] Test usage tracking
    - [ ] Verify webhook signature validation
    - [ ] Test subscription upgrades/downgrades
    - [ ] Test proration calculations

**Estimated Time:** 20-25 hours  
**Dependencies:** Phase 0 (Auth), Phase 3 (APIs), Phase 6 (Frontend)

**Note:** This phase can be implemented after core features are complete. It's designed to be added as a monetization layer without disrupting existing functionality.

---

## Summary

### Total Estimated Time: 100-125 hours (~2.5-3 weeks full-time) for MVP
*Phase 12 (Billing) and other post-MVP features documented in `BACKLOG.md`*

### Critical Path Dependencies:
1. Phase 0 → Phase 1 → Phase 2 → Phase 3 (Foundation + Auth)
2. Phase 1 → Phase 4 (Crawler needs DB)
3. Phase 2 → Phase 6, 7, 8, 9 (Frontend needs repositories)
4. Phase 3 → Phase 6, 7, 8, 9 (Frontend needs APIs)
5. Phase 4 → Phase 9 (Company intelligence needs crawler data)
6. Phase 0 (Auth) → Phase 9 (Bookmarking requires auth)
7. Phase 0, 3, 5 → Phase 12 (Billing can be added post-MVP)

### Recommended Development Order (MVP):
1. **Week 1:** Phases 0, 1, 2, 3 (Foundation + APIs + Auth)
2. **Week 2:** Phases 4, 5, 6 (Crawler + Frontend core)
3. **Week 3:** Phases 7, 8, 9, 10, 11 (Features + Admin + Testing)

**Post-MVP:** Phase 12 (Billing) and features in `BACKLOG.md` can be added after launch

### Key Technical Decisions:
- **Web Crawling:** Use Puppeteer or Playwright (Playwright recommended for better reliability)
- **Email:** Use Resend (modern, developer-friendly)
- **PDF Parsing:** Use `pdf-parse` or `pdfjs-dist`
- **Company Enrichment:** Start with manual mapping, add APIs later if needed
- **Spend Extraction:** Only explicit costs for MVP, no estimation
- **Authentication:** Supabase Auth (email/password, OAuth optional)
- **Billing:** Stripe (subscriptions, usage tracking, customer portal)

### Risk Mitigation:
- **Crawler Reliability:** Build robust error handling, retry logic, and fallback strategies
- **Data Quality:** Simple field count for completeness, manual review workflows
- **Performance:** Use database indexes, pagination, and caching from the start
- **Compliance:** Ensure robots.txt compliance and ethical crawling practices

---

## Next Steps

1. Review and approve this development plan
2. Set up project repository and initial structure
3. Begin Phase 0: Project Setup & Infrastructure
4. Create detailed task tickets for each phase (if using project management tool)

