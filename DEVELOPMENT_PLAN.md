# Development Plan: Conference IQ (V1.3)

**Based on PRD V1.3**  
**Tech Stack: Next.js (Vercel) + Supabase**

---

## Table of Contents

1. [Phase 0: Project Setup & Infrastructure](#phase-0-project-setup--infrastructure)
2. [Phase 1: Database Schema & Migrations](#phase-1-database-schema--migrations)
3. [Phase 2: Core Data Models & Repositories](#phase-2-core-data-models--repositories)
4. [Phase 3: API Endpoints](#phase-3-api-endpoints)
5. [Phase 4: Frontend - Conference Directory](#phase-4-frontend---conference-directory)
6. [Phase 5: Frontend - Conference Detail Pages](#phase-5-frontend---conference-detail-pages)
7. [Phase 6: Speaker Intelligence Features](#phase-6-speaker-intelligence-features)
8. [Phase 7: Company Search & Intelligence](#phase-7-company-search--intelligence)
9. [Phase 8: Bookmarking System](#phase-8-bookmarking-system)
10. [Phase 9: Admin Interface](#phase-9-admin-interface)
11. [Phase 10: Authentication](#phase-10-authentication)
12. [Phase 11: Web Crawling Agent](#phase-11-web-crawling-agent)
13. [Phase 12: Testing & Deployment](#phase-12-testing--deployment)
14. [Phase 13: Stripe Billing](#phase-13-stripe-billing)

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
   - [x] Configure environment variables (`.env.local`) *(All credentials configured and tested)*
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
   - [x] Create `conferences` table
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

   - [x] Create `speakers` table
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
     
     **Note:** Future consideration: A universal "Person" model could be introduced where individuals can be Speakers at one conference and Attendees at another. This would require a refactor to have a `people` table with a junction table `conference_people` that includes a `role` field ('speaker', 'attendee', etc.). For MVP, we're keeping the simpler `speakers` table structure.

   - [x] Create `exhibitors` table
     - id (uuid, primary key)
     - conference_id (uuid, foreign key → conferences)
     - company_name (text)
     - exhibitor_tier_raw (text)
     - exhibitor_tier_normalized (text: 'platinum', 'gold', 'silver', 'bronze', 'standard', 'unknown', nullable)
     - estimated_cost (numeric, nullable - only explicit costs, no estimates)
     - source_url (text)
     - created_at (timestamp)
     - updated_at (timestamp)

   - [x] Create `bookmarks` table
     - id (uuid, primary key)
     - user_id (uuid, foreign key → auth.users)
     - conference_id (uuid, foreign key → conferences)
     - created_at (timestamp)
     - UNIQUE(user_id, conference_id)

   - [x] Create `crawl_logs` table
     - id (uuid, primary key)
     - conference_id (uuid, foreign key → conferences)
     - status (text: 'success', 'failed', 'partial')
     - data_extracted (jsonb)
     - error_message (text)
     - crawled_at (timestamp)


2. **Indexes & Views**
   - [x] Create indexes:
     - `conferences(url)` (unique) ✅
     - `conferences(industry)` ✅ (GIN index)
     - `conferences(start_date)` ✅
     - `speakers(conference_id)` ✅
     - `speakers(company)` ✅
     - `exhibitors(conference_id)` ✅
     - `exhibitors(company_name)` ✅
     - `bookmarks(user_id, conference_id)` ✅
     - Additional indexes: `crawl_logs` indexes, `speakers(name)`, `exhibitors(tier)`, `conferences(created_at)` ✅

   - [ ] **Note:** Company intelligence will use simple SQL queries instead of materialized views for MVP. Views can be added later if performance becomes an issue.

3. **Row-Level Security (RLS)**
   - [x] Enable RLS on all tables
   - [x] Create policies:
     - `conferences`: public read, admin write
     - `speakers`: public read, admin write
     - `exhibitors`: public read, admin write
     - `bookmarks`: users can read/write their own
     - `crawl_logs`: admin only

4. **Storage Buckets**
   - [x] Create `raw-html` bucket (public read, admin write)
   - [x] Create `pdfs` bucket (public read, admin write)

**Estimated Time:** 4-6 hours  
**Dependencies:** Phase 0

**Status:** ✅ Complete - All tables, indexes, RLS policies, and storage buckets created successfully

---

## Phase 2: Core Data Models & Repositories

### Tasks

1. **Repository Pattern Setup**
   - [x] Create `lib/repositories/base.repository.ts` (base class)
   - [x] Create repository interfaces in `lib/repositories/types.ts`

2. **Conference Repository**
   - [x] `lib/repositories/conferences.repository.ts`
     - [x] `findAll(filters, pagination)`
     - [x] `findById(id)`
     - [x] `findByUrl(url)`
     - [x] `create(data)`
     - [x] `update(id, data)`
     - [x] `updateCompletenessCount(id)` (simple field count)
     - [x] `search(query, filters)`

3. **Speaker Repository**
   - [x] `lib/repositories/speakers.repository.ts`
     - [x] `findByConferenceId(conferenceId)`
     - [x] `findByCompany(companyName)`
     - [x] `createMany(speakers[])`
     - [x] `getCompanyStats(conferenceId)` (group by company, count per company)

4. **Exhibitor Repository**
   - [x] `lib/repositories/exhibitors.repository.ts`
     - [x] `findByConferenceId(conferenceId)`
     - [x] `findByCompany(companyName)`
     - [x] `createMany(exhibitors[])`
     - [x] `getTierDistribution(conferenceId)` (simple tier counts)

5. **Company Intelligence Repository**
   - [x] `lib/repositories/company-intelligence.repository.ts`
     - [x] `searchCompanies(query)`
     - [x] `getExhibitorHistory(companyName)`
     - [x] `getSpeakerHistory(companyName)`
     - [x] `getEstimatedSpend(companyName)` (sum of explicit costs only, no estimates)
     - [x] `getFullProfile(companyName)`

6. **Bookmark Repository**
   - [x] `lib/repositories/bookmarks.repository.ts`
     - [x] `findByUserId(userId)`
     - [x] `create(userId, conferenceId)`
     - [x] `delete(userId, conferenceId)`
     - [x] `isBookmarked(userId, conferenceId)`

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 1

---

## Phase 3: API Endpoints

### Tasks

1. **Conference Endpoints**
   - [x] `app/api/conferences/route.ts`
     - [x] `GET /api/conferences` (list with filters, pagination)
     - [x] `POST /api/conferences` (admin only, create)
   
   - [x] `app/api/conferences/[id]/route.ts`
     - [x] `GET /api/conferences/[id]` (get by id)
     - [x] `PATCH /api/conferences/[id]` (admin only, update)
     - [x] `DELETE /api/conferences/[id]` (admin only, delete)

   - [x] `app/api/conferences/search/route.ts`
     - [x] `GET /api/conferences/search?q=...` (search)

2. **Speaker Endpoints**
   - [x] `app/api/conferences/[id]/speakers/route.ts`
     - [x] `GET /api/conferences/[id]/speakers` (get speakers for conference)

   - [x] `app/api/speakers/companies/route.ts`
     - [x] `GET /api/speakers/companies?conferenceId=...` (get company stats)

3. **Exhibitor Endpoints**
   - [x] `app/api/conferences/[id]/exhibitors/route.ts`
     - [x] `GET /api/conferences/[id]/exhibitors` (get exhibitors for conference)

4. **Company Intelligence Endpoints**
   - [x] `app/api/companies/search/route.ts`
     - [x] `GET /api/companies/search?q=...` (search companies)

   - [x] `app/api/companies/[companyName]/exhibitors/route.ts`
     - [x] `GET /api/companies/[companyName]/exhibitors` (exhibitor history)

   - [x] `app/api/companies/[companyName]/speakers/route.ts`
     - [x] `GET /api/companies/[companyName]/speakers` (speaker history)

   - [x] `app/api/companies/[companyName]/profile/route.ts`
     - [x] `GET /api/companies/[companyName]/profile` (full intelligence profile)

5. **Bookmark Endpoints**
   - [x] `app/api/bookmarks/route.ts`
     - [x] `GET /api/bookmarks` (user's bookmarks)
     - [x] `POST /api/bookmarks` (create bookmark)

   - [x] `app/api/bookmarks/[conferenceId]/route.ts`
     - [x] `DELETE /api/bookmarks/[conferenceId]` (remove bookmark)

6. **Admin Endpoints**
   - [x] `app/api/admin/crawl/route.ts`
     - [x] `POST /api/admin/crawl` (trigger crawl for URL - placeholder for Phase 4)

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 2

**Status:** ✅ Complete - All API endpoints implemented with authentication, validation, and error handling

---

## Phase 4: Frontend - Conference Directory

### Tasks

1. **Layout & Navigation**
   - [x] `app/components/layout/Navbar.tsx`
   - [x] `app/components/layout/Layout.tsx`
   - [x] Set up routing structure

2. **Conference List Page**
   - [x] `app/conferences/page.tsx`
     - [x] Display paginated conference list
     - [x] Search functionality
     - [x] Filter by industry, date range, location
     - [x] Sort by date, name, completeness
     - [x] Display key info: name, dates, location, simple completeness indicator

3. **Search & Filters Component**
   - [x] `app/components/ConferenceFilters.tsx`
     - [x] Search input
     - [x] Industry multi-select
     - [x] Date range picker
     - [x] Location filter
     - [x] Clear filters button

4. **Conference Card Component**
   - [x] `app/components/ConferenceCard.tsx`
     - [x] Display conference preview
     - [x] Link to detail page
     - [x] Show bookmark button
     - [x] Show simple data completeness indicator (X of Y fields)

5. **Pagination Component**
   - [x] `app/components/Pagination.tsx`
     - [x] Handle page navigation
     - [x] Display page numbers

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 3

**Status:** ✅ Complete - All components implemented with responsive design, filtering, sorting, and pagination

---

## Phase 5: Frontend - Conference Detail Pages

### Tasks

1. **Conference Detail Page**
   - [x] `app/conferences/[id]/page.tsx`
     - [x] Display full conference information
     - [x] Show all data fields from PRD
     - [x] Share functionality (bookmark button disabled until Phase 12)

2. **Detail Page Sections**
   - [x] `app/components/conferences/BasicInfo.tsx` (dates, location, attendance)
   - [x] `app/components/conferences/ExhibitorList.tsx` (simple list, no competitor tags)
   - [x] `app/components/conferences/SpeakerList.tsx` (with basic company grouping)
   - [x] `app/components/conferences/PricingInfo.tsx` (explicit costs only, show message if not available)
   - [x] `app/components/conferences/Agenda.tsx` (link to agenda URL if available)
   - [x] `app/components/conferences/ContactInfo.tsx`
   - [x] `app/components/conferences/DataCompleteness.tsx` (simple field count: "X of Y fields populated", last crawled date)

3. **Basic Speaker Company Stats**
   - [x] `app/components/conferences/SpeakerCompanyStats.tsx`
     - [x] Group speakers by company
     - [x] Show speaker count per company
     - [x] Simple list display (no charts, no industry distribution, no seniority analysis)

**Estimated Time:** 10-12 hours  
**Dependencies:** Phase 3, Phase 4

**Status:** ✅ Complete - All detail page components implemented with responsive design and proper data display

---

## Phase 6: Speaker Intelligence Features

### Tasks

1. **Speaker List Enhancements**
   - [x] Enhance `SpeakerList.tsx` with company grouping
   - [x] Add filters: by company, by title, by industry
   - [x] Add sorting options (by name, company, title)

2. **Company Speaker Stats**
   - [x] `app/components/speakers/CompanySpeakerStats.tsx`
     - [x] Display company distribution
     - [x] Show speaker count per company
     - [x] Visualize with charts (recharts)

3. **Seniority Pattern Analysis**
   - [x] `app/components/speakers/SeniorityPatterns.tsx`
     - [x] Categorize titles (C-suite, VP, Director, Manager, IC, etc.)
     - [x] Display distribution with pie chart
     - [x] Identify patterns (VP-heavy, IC-heavy, etc.)

4. **Industry Distribution**
   - [x] `app/components/speakers/IndustryDistribution.tsx`
     - [x] Show industries represented by speakers
     - [x] Visualize distribution with bar chart

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 3, Phase 4

**Status:** ✅ Complete - All speaker intelligence features implemented with charts, filters, and pattern analysis

---

## Phase 7: Company Search & Intelligence

### Tasks

1. **Company Search Page**
   - [x] `app/companies/page.tsx`
     - [x] Search input with debounced search
     - [x] Display search results
     - [x] Link to company profile

2. **Company Profile Page**
   - [x] `app/companies/[companyName]/page.tsx`
     - [x] Display full company intelligence profile
     - [x] Show exhibitor history
     - [x] Show speaker history
     - [x] Show estimated spend summary

3. **Company Profile Components**
   - [x] `app/components/companies/ExhibitorHistory.tsx`
     - [x] List conferences where company exhibited
     - [x] Show tier and explicit cost per conference (if known)
     - [x] Show total spend (sum of explicit costs only, no estimates)
     - [x] Show "Unknown" for conferences without explicit pricing
   
   - [x] `app/components/companies/SpeakerHistory.tsx`
     - [x] List conferences where company had speakers
     - [x] Show speaker count per conference
     - [x] Simple list display

4. **Spend Display (Simplified)**
   - [x] Display known costs only
   - [x] Show "Unknown" for conferences without explicit pricing
   - [x] Display disclaimer: "Only explicit costs shown, estimates not included"

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 3, Phase 10

**Status:** ✅ Complete - Company search and profile pages implemented with full intelligence display

---

## Phase 8: Bookmarking System

### Tasks

1. **Bookmark Integration with Auth**
   - [x] Use existing authentication from Phase 0
   - [x] Protect bookmark routes (require authentication)
   - [x] Add user context to bookmark operations

2. **Bookmark UI Components**
   - [x] `app/components/BookmarkButton.tsx` (toggle bookmark)
   - [x] `app/components/BookmarkIcon.tsx` (bookmark icon with state)

3. **Bookmarks Page**
   - [x] `app/bookmarks/page.tsx`
     - [x] Display user's bookmarked conferences
     - [x] Same filtering/sorting as main directory

4. **Bookmark Integration**
   - [x] Add bookmark buttons to conference cards
   - [x] Add bookmark button to detail pages
   - [x] Enable bookmarks link in navbar

**Estimated Time:** 4-6 hours  
**Dependencies:** Phase 0 (Auth), Phase 1, Phase 3, Phase 4

**Status:** ✅ Complete - Bookmarking system fully implemented with UI components, bookmark page, and integration into conference cards and detail pages

---

## Phase 9: Admin Interface

### Tasks

1. **Admin Authentication & Security**
   - [x] Create admin role check (using `user.user_metadata.role === 'admin'`)
   - [x] Protect admin routes in middleware (redirect non-admins)
   - [x] Protect admin API routes (use `requireAdmin()`)
   - [x] Create admin layout with access check
   - [x] Add admin-only error pages (403 Forbidden)
   - [x] **Security Note:** Admin interface is ONLY accessible to internal admin staff. All `/admin/*` routes and `/api/admin/*` endpoints must verify admin role.

2. **Basic Conference Management**
   - [x] `app/admin/conferences/page.tsx`
     - [x] List all conferences (simple table)
     - [x] Create new conference (manual entry form)
     - [x] Edit conference data
     - [x] Delete conferences
     - [x] Basic search/filter

3. **Crawl Management (Basic)**
   - [x] `app/admin/crawl/page.tsx`
     - [x] Manual crawl trigger (single URL input)
     - [x] View crawl logs (simple list, recent first)
     - [x] Basic error display
   - [x] `app/api/admin/crawl-logs/route.ts` - API endpoint for fetching crawl logs

**Note:** Advanced admin features (dashboard stats, email outreach, bulk operations, data quality tools) deferred to post-MVP. See `BACKLOG.md`.

**Security Requirements:**
- All admin pages must check for admin role before rendering
- All admin API routes must use `requireAdmin()` from `lib/utils/auth.ts`
- Middleware must redirect non-admin users attempting to access `/admin/*` routes
- Admin role is set in Supabase user metadata: `user_metadata.role = 'admin'`

**Estimated Time:** 6-8 hours  
**Dependencies:** Phase 3

**Status:** ✅ Complete - Admin interface fully implemented with security, conference management, and crawl management

---

## Phase 10: Authentication

### Tasks

1. **User Profile Database Schema**
   - [x] Create `profiles` table in database:
     - id (uuid, primary key, references auth.users(id))
     - display_name (text, nullable)
     - avatar_url (text, nullable)
     - bio (text, nullable)
     - onboarding_completed (boolean, default false)
     - email_verified (boolean, default false)
     - last_login_at (timestamp, nullable)
     - preferences (jsonb, nullable) - for storing user preferences
     - created_at (timestamp)
     - updated_at (timestamp)
   - [x] Create trigger to automatically create profile when user signs up
   - [x] Add RLS policies for profiles (users can read/update their own profile)
   - [x] Create indexes on profiles table

2. **Enhanced Authentication**
   - [x] Review and enhance existing auth from Phase 0
   - [x] Add email verification flow
   - [x] Add password reset flow
   - [ ] Add OAuth providers (Google, GitHub) - optional
   - [x] Add session management and refresh tokens (handled by Supabase)
   - [ ] Add user onboarding flow
   - [x] Remove temporary auth bypass (currently bypassed until Phase 12)
   - [x] Enable authentication on all protected routes
   - [x] Update middleware to properly enforce authentication

3. **User Profile Management**
   - [x] Create `lib/repositories/profiles.repository.ts`:
     - [x] `findByUserId(userId)`
     - [x] `create(userId, data)`
     - [x] `update(userId, data)`
     - [x] `updateLastLogin(userId)`
     - [x] `completeOnboarding(userId)`
     - [x] `updateEmailVerified(userId, verified)`
     - [x] `updatePreferences(userId, preferences)`
   - [x] Enhance `app/profile/page.tsx` with full user profile
   - [x] Add profile editing capabilities
   - [x] Add password change functionality
   - [ ] Add avatar upload functionality (optional - deferred)

4. **Protected Routes**
   - [x] Ensure all bookmark routes require authentication
   - [x] Ensure admin routes require admin role
   - [x] Add proper redirects for unauthenticated users
   - [x] Add proper redirects for non-admin users accessing admin routes

5. **Session Management**
   - [x] Implement session refresh logic (handled by Supabase Auth helpers)
   - [x] Add session timeout handling (handled by Supabase)
   - [ ] Add "Remember me" functionality (optional - Supabase handles this)
   - [x] Handle token expiration gracefully (handled by middleware)

6. **Email Verification**
   - [x] Set up email verification templates (handled by Supabase)
   - [x] Add email verification flow in signup
   - [x] Add resend verification email functionality
   - [x] Add verified badge/indicator in UI
   - [x] Create email verification page (`/auth/verify-email`)

7. **Password Reset**
   - [x] Set up password reset email templates (handled by Supabase)
   - [x] Add "Forgot Password" page (`/auth/forgot-password`)
   - [x] Add password reset flow (`/auth/reset-password`)
   - [x] Add password reset confirmation

8. **Resend SMTP Configuration (Production Email Service)**
   - [ ] Configure Resend SMTP in Supabase Dashboard:
     - [ ] Go to Supabase Dashboard → Project Settings → Auth → SMTP Settings
     - [ ] Get Resend API key from Resend dashboard
     - [ ] Configure SMTP settings:
       - SMTP Host: `smtp.resend.com`
       - SMTP Port: `465` (SSL) or `587` (TLS)
       - SMTP User: `resend`
       - SMTP Password: Resend API key
       - Sender Email: Verified domain email (e.g., `noreply@yourdomain.com`)
       - Sender Name: `Conference IQ`
     - [ ] Verify domain in Resend (if using custom domain)
     - [ ] Test email delivery (signup, verification, password reset)
   - [ ] Update Supabase Site URL to production URL:
     - [ ] Go to Project Settings → Auth → URL Configuration
     - [ ] Set Site URL to production URL (e.g., `https://conference-iq.vercel.app`)
     - [ ] Add redirect URLs for production:
       - `/auth/verify-email`
       - `/auth/reset-password`
   - [ ] Document Resend configuration in `EMAIL_VERIFICATION_TROUBLESHOOTING.md`
   - [ ] Add `NEXT_PUBLIC_SITE_URL` environment variable to Vercel
   - [ ] **Note:** Supabase's default email service has severe rate limits (4 emails/hour) and is not suitable for production. Resend SMTP is required for production email delivery.

**Estimated Time:** 10-12 hours (includes 1-2 hours for Resend SMTP setup)  
**Dependencies:** Phase 0 (Basic Auth), Phase 1 (Database Schema), Phase 8 (Bookmarking), Phase 9 (Admin Interface)

**Status:** ✅ Mostly Complete - Core authentication features implemented:
- ✅ User profiles table and repository
- ✅ Email verification flow
- ✅ Password reset flow
- ✅ Profile editing and password change
- ✅ Protected routes enforcement
- ⏳ Resend SMTP configuration (required for production email delivery)
- ⏳ OAuth providers (optional - can be added later)
- ⏳ User onboarding flow (can be added later)

---

## Phase 11: Web Crawling Agent

### Tasks

1. **Crawler Core**
   - [x] `lib/services/crawler/base-crawler.ts` (base class)
   - [x] `lib/services/crawler/conference-crawler.ts` (main crawler)
   - [x] Configure Puppeteer/Playwright with ethical settings
   - [x] Implement robots.txt checking

2. **Data Extraction Modules**
   - [x] `lib/services/crawler/extractors/basic-info.ts`
     - Extract name, dates, location, URL
   
   - [x] `lib/services/crawler/extractors/speakers.ts`
     - Extract speaker list (name, title, company)
     - Use pattern matching for parsing
     - Store company name as-is (no enrichment)
   
   - [x] `lib/services/crawler/extractors/exhibitors.ts`
     - Extract exhibitor list
     - Extract tier information if explicitly stated
     - Parse explicit costs only ("Gold Sponsor - $25,000")
   
   - [x] `lib/services/crawler/extractors/pricing.ts`
     - Extract ticket pricing (if easily accessible)
     - Extract sponsor tier pricing (explicit costs only)
     - Basic PDF parsing for pricing docs (if straightforward)
   
   - [x] `lib/services/crawler/extractors/contact.ts`
     - Extract organizer contact information
     - Extract agenda URL (store URL only, don't parse content)

3. **Simplified Spend Extraction**
   - [x] `lib/services/spend-extraction.ts` (simplified, no estimation)
     - Parse explicit tier costs ("Gold Sponsor - $25,000")
     - Extract from PDF pricing documents (if easily parseable)
     - Mark as "Unknown" if cost not explicitly stated
     - **No tier inference, no industry averages, no cost ranges**

4. **Crawler Service Integration**
   - [x] `lib/services/crawler-service.ts`
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
**Dependencies:** Phase 1, Phase 2, Phase 9 (Admin Interface)

**Note:** This phase was moved after Phase 9 (Admin Interface) to allow the admin interface to be built first, which can then be used to manually trigger and monitor crawls.

---

## Phase 12: Testing & Deployment

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

## Phase 13: Stripe Billing

### Tasks

1. **Stripe Setup**
   - [ ] Create Stripe account and get API keys
   - [ ] Install Stripe libraries (`stripe`, `@stripe/stripe-js`)
   - [ ] Set up Stripe webhook endpoint (`app/api/webhooks/stripe/route.ts`)
   - [ ] Configure Stripe products and prices in dashboard
   - [ ] Set up test and production environments

2. **Subscription Plans**
   - [ ] Define subscription tiers (e.g., Free, Pro, Enterprise)
   - [ ] Create products and prices in Stripe
   - [ ] Design pricing page (`app/pricing/page.tsx`)
   - [ ] Create subscription management UI

3. **Database Schema for Billing**
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

4. **Stripe Integration Services**
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

5. **Billing API Endpoints**
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

6. **Frontend Billing Pages**
   - [ ] `app/pricing/page.tsx` (pricing page with plan comparison)
   - [ ] `app/billing/page.tsx` (billing dashboard):
     - Current subscription status
     - Usage statistics
     - Payment method management
     - Invoice history
     - Upgrade/downgrade options
   
   - [ ] `app/billing/success/page.tsx` (checkout success page)
   - [ ] `app/billing/cancel/page.tsx` (checkout cancel page)

7. **Feature Gating**
   - [ ] Create `lib/middleware/feature-gate.ts` (middleware for feature access)
   - [ ] Implement feature gates:
     - Free tier: Limited conference views, basic search
     - Pro tier: Unlimited views, company intelligence, advanced filters
     - Enterprise tier: API access, bulk exports, custom features
   - [ ] Add feature gate checks to API endpoints
   - [ ] Add upgrade prompts in UI when limits reached

8. **Usage Tracking**
   - [ ] Track feature usage (conference views, company searches, etc.)
   - [ ] Display usage in billing dashboard
   - [ ] Show usage limits based on subscription tier
   - [ ] Implement rate limiting for API endpoints

9. **Subscription Management UI Components**
    - [ ] `app/components/billing/SubscriptionCard.tsx` (current subscription display)
    - [ ] `app/components/billing/UsageStats.tsx` (usage statistics)
    - [ ] `app/components/billing/UpgradePrompt.tsx` (upgrade CTA)
    - [ ] `app/components/billing/PlanComparison.tsx` (plan comparison table)

10. **Email Notifications (Billing)**
    - [ ] Set up email templates for:
      - Subscription confirmation
      - Payment success
      - Payment failure
      - Subscription cancellation
      - Usage limit warnings
    - [ ] Integrate with email service (Resend)

11. **Testing & Security**
    - [ ] Test subscription flows (test mode)
    - [ ] Test webhook handling
    - [ ] Test feature gating
    - [ ] Test usage tracking
    - [ ] Verify webhook signature validation
    - [ ] Test subscription upgrades/downgrades
    - [ ] Test proration calculations

**Estimated Time:** 20-25 hours  
**Dependencies:** Phase 10 (Authentication), Phase 3 (APIs), Phase 6 (Frontend)

**Note:** This phase can be implemented after core features and authentication are complete. It's designed to be added as a monetization layer without disrupting existing functionality.

---

## Summary

### Total Estimated Time: 100-125 hours (~2.5-3 weeks full-time) for MVP
*Phase 12 (Billing) and other post-MVP features documented in `BACKLOG.md`*

### Critical Path Dependencies:
1. Phase 0 → Phase 1 → Phase 2 → Phase 3 (Foundation + Basic Auth)
2. Phase 1 → Phase 11 (Crawler needs DB)
3. Phase 2 → Phase 4, 5, 6, 7, 8 (Frontend needs repositories)
4. Phase 3 → Phase 4, 5, 6, 7, 8 (Frontend needs APIs)
5. Phase 11 → Phase 7 (Company intelligence needs crawler data)
6. Phase 0 (Basic Auth) → Phase 8 (Bookmarking requires auth)
7. Phase 3 → Phase 9 (Admin Interface needs APIs)
8. Phase 9 → Phase 11 (Admin Interface can trigger/manage crawls)
9. Phase 10 (Full Auth) → Phase 13 (Billing requires full authentication)
10. Phase 0, 3, 5 → Phase 13 (Billing can be added post-MVP)

### Recommended Development Order (MVP):
1. **Week 1:** Phases 0, 1, 2, 3 (Foundation + APIs + Basic Auth)
2. **Week 2:** Phases 4, 5, 6, 7, 8, 9 (Frontend + Features + Admin)
3. **Week 3:** Phase 10, 11, 12 (Full Auth + Crawler + Testing)

**Post-MVP:** Phase 13 (Billing) and features in `BACKLOG.md` can be added after launch

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

