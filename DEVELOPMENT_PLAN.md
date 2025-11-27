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
6. [Phase 5: Email Outreach Agent](#phase-5-email-outreach-agent)
7. [Phase 6: Frontend - Conference Directory](#phase-6-frontend---conference-directory)
8. [Phase 7: Frontend - Conference Detail Pages](#phase-7-frontend---conference-detail-pages)
9. [Phase 8: Speaker Intelligence Features](#phase-8-speaker-intelligence-features)
10. [Phase 9: Company Search & Intelligence](#phase-9-company-search--intelligence)
11. [Phase 10: Bookmarking System](#phase-10-bookmarking-system)
12. [Phase 11: Admin Interface](#phase-11-admin-interface)
13. [Phase 12: Testing & Deployment](#phase-12-testing--deployment)

---

## Phase 0: Project Setup & Infrastructure

### Tasks

1. **Initialize Next.js Project**
   - [ ] Create Next.js 14+ app with TypeScript
   - [ ] Configure Tailwind CSS
   - [ ] Set up project structure (`app/`, `lib/`, `components/`, `types/`)
   - [ ] Configure ESLint and Prettier

2. **Supabase Setup**
   - [ ] Create Supabase project
   - [ ] Install Supabase client libraries (`@supabase/supabase-js`)
   - [ ] Configure environment variables (`.env.local`)
   - [ ] Set up Supabase client utilities (`lib/supabase.ts`)

3. **Vercel Configuration**
   - [ ] Configure `vercel.json` for routing
   - [ ] Set up environment variables in Vercel dashboard
   - [ ] Configure build settings

4. **Project Dependencies**
   - [ ] Install core dependencies:
     - `next`, `react`, `react-dom`
     - `@supabase/supabase-js`
     - `@supabase/auth-helpers-nextjs`
     - `tailwindcss`, `autoprefixer`, `postcss`
     - `typescript`, `@types/node`, `@types/react`
   - [ ] Install agent dependencies:
     - `puppeteer` or `playwright` (web crawling)
     - `cheerio` (HTML parsing)
     - `pdf-parse` (PDF extraction)
     - `nodemailer` or `resend` (email)
   - [ ] Install utility libraries:
     - `date-fns` (date handling)
     - `zod` (validation)
     - `lucide-react` (icons)

5. **Type Definitions**
   - [ ] Create `types/index.ts` with core types:
     - `Conference`, `Speaker`, `Exhibitor`
     - `CompanyIntelligence`, `Bookmark`
     - API response types

**Estimated Time:** 4-6 hours  
**Dependencies:** None

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
     - data_completeness_score (numeric 0-1)
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
     - company_industry (text)
     - company_size_bucket (text: 'startup', 'mid', 'enterprise', 'unknown')
     - source_url (text)
     - confidence_score (numeric 0-1)
     - created_at (timestamp)
     - updated_at (timestamp)

   - [ ] Create `exhibitors` table
     - id (uuid, primary key)
     - conference_id (uuid, foreign key → conferences)
     - company_name (text)
     - exhibitor_tier_raw (text)
     - exhibitor_tier_normalized (text: 'platinum', 'gold', 'silver', 'bronze', 'standard', 'unknown')
     - estimated_cost_low (numeric)
     - estimated_cost_high (numeric)
     - is_competitor (boolean, default false)
     - source_url (text)
     - confidence_score (numeric 0-1)
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

   - [ ] Create `email_outreach_logs` table
     - id (uuid, primary key)
     - conference_id (uuid, foreign key → conferences)
     - recipient_email (text)
     - subject (text)
     - status (text: 'sent', 'failed', 'bounced')
     - sent_at (timestamp)

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

   - [ ] Create `company_exhibitor_index` materialized view
     - company_name
     - conference_ids (array of uuid)
     - exhibitor_tiers (array of text)
     - estimated_annual_spend_low (sum)
     - estimated_annual_spend_high (sum)
     - last_updated (timestamp)

   - [ ] Create `company_speaker_index` view
     - company_name
     - conference_ids (array of uuid)
     - speaker_count (count)
     - roles (array of distinct titles)
     - industries (array of distinct industries)

3. **Row-Level Security (RLS)**
   - [ ] Enable RLS on all tables
   - [ ] Create policies:
     - `conferences`: public read, admin write
     - `speakers`: public read, admin write
     - `exhibitors`: public read, admin write
     - `bookmarks`: users can read/write their own
     - `crawl_logs`: admin only
     - `email_outreach_logs`: admin only

4. **Storage Buckets**
   - [ ] Create `raw-html` bucket (public read, admin write)
   - [ ] Create `pdfs` bucket (public read, admin write)
   - [ ] Create `email-attachments` bucket (admin only)

**Estimated Time:** 6-8 hours  
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
     - `updateCompletenessScore(id)`
     - `search(query, filters)`

3. **Speaker Repository**
   - [ ] `lib/repositories/speakers.repository.ts`
     - `findByConferenceId(conferenceId)`
     - `findByCompany(companyName)`
     - `createMany(speakers[])`
     - `getCompanyStats(conferenceId)` (group by company)
     - `getSeniorityPatterns(conferenceId)`

4. **Exhibitor Repository**
   - [ ] `lib/repositories/exhibitors.repository.ts`
     - `findByConferenceId(conferenceId)`
     - `findByCompany(companyName)`
     - `createMany(exhibitors[])`
     - `getCompetitorList(conferenceId)`
     - `getTierDistribution(conferenceId)`

5. **Company Intelligence Repository**
   - [ ] `lib/repositories/company-intelligence.repository.ts`
     - `searchCompanies(query)`
     - `getExhibitorHistory(companyName)`
     - `getSpeakerHistory(companyName)`
     - `getEstimatedSpend(companyName)`
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

   - [ ] `app/api/admin/email-outreach/route.ts`
     - `POST /api/admin/email-outreach` (trigger email outreach)

**Estimated Time:** 10-12 hours  
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
     - Use pattern matching and NLP for parsing
   
   - [ ] `lib/services/crawler/extractors/exhibitors.ts`
     - Extract exhibitor list
     - Extract tier information
     - Parse tier names and costs
   
   - [ ] `lib/services/crawler/extractors/pricing.ts`
     - Extract ticket pricing
     - Extract sponsor tier pricing
     - Handle PDF parsing for pricing docs
   
   - [ ] `lib/services/crawler/extractors/agenda.ts`
     - Extract agenda/schedule information
   
   - [ ] `lib/services/crawler/extractors/contact.ts`
     - Extract organizer contact information

3. **Spend Estimation Logic**
   - [ ] `lib/services/spend-estimation.ts`
     - Parse explicit tier costs ("Gold Sponsor - $25,000")
     - Extract from PDF pricing documents
     - Infer tier costs from normalized tier names
     - Use industry averages for unknown tiers
     - Return cost ranges (low, high)

4. **Company Intelligence Enrichment**
   - [ ] `lib/services/company-enrichment.ts`
     - Enrich speaker companies with industry/size data
     - Use public APIs (Clearbit, etc.) or manual mapping
     - Infer company size from public data

5. **Crawler Service Integration**
   - [ ] `lib/services/crawler-service.ts`
     - Orchestrate full crawl process
     - Save raw HTML to Supabase Storage
     - Save PDFs to Supabase Storage
     - Update conference records
     - Create speakers and exhibitors records
     - Log crawl results

6. **Cron Job / Background Task**
   - [ ] `app/api/cron/crawl/route.ts` (Vercel cron or Supabase Edge Function)
   - Schedule periodic crawls
   - Handle queue of URLs to crawl

**Estimated Time:** 20-25 hours  
**Dependencies:** Phase 1, Phase 2

---

## Phase 5: Email Outreach Agent

### Tasks

1. **Email Service Setup**
   - [ ] Configure email provider (Resend recommended)
   - [ ] Set up email templates
   - [ ] `lib/services/email-service.ts` (email sending utilities)

2. **Email Templates**
   - [ ] Create template for conference data request
   - [ ] Personalize with conference name, organizer name
   - [ ] Include data request form or link

3. **Outreach Logic**
   - [ ] `lib/services/email-outreach-service.ts`
     - Find conferences missing data
     - Generate personalized emails
     - Send emails via Resend
     - Log outreach attempts
     - Handle bounces and failures

4. **Email Parsing (Future)**
   - [ ] Basic email response parsing (if responses come in)
   - [ ] Extract data from email attachments

5. **Admin Interface Integration**
   - [ ] Manual trigger for email outreach
   - [ ] View outreach logs
   - [ ] Resend failed emails

**Estimated Time:** 8-10 hours  
**Dependencies:** Phase 1, Phase 2

---

## Phase 6: Frontend - Conference Directory

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
     - Display key info: name, dates, location, completeness score

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
     - Show data completeness indicator

5. **Pagination Component**
   - [ ] `app/components/Pagination.tsx`
     - Handle page navigation
     - Display page numbers

**Estimated Time:** 10-12 hours  
**Dependencies:** Phase 3

---

## Phase 7: Frontend - Conference Detail Pages

### Tasks

1. **Conference Detail Page**
   - [ ] `app/conferences/[id]/page.tsx`
     - Display full conference information
     - Show all data fields from PRD
     - Bookmark button
     - Share functionality

2. **Detail Page Sections**
   - [ ] `app/components/conferences/BasicInfo.tsx` (dates, location, attendance)
   - [ ] `app/components/conferences/ExhibitorList.tsx` (with competitor tags)
   - [ ] `app/components/conferences/SpeakerList.tsx` (with company grouping)
   - [ ] `app/components/conferences/PricingInfo.tsx`
   - [ ] `app/components/conferences/Agenda.tsx`
   - [ ] `app/components/conferences/ContactInfo.tsx`
   - [ ] `app/components/conferences/DataCompleteness.tsx` (completeness score, source provenance)

3. **Speaker Intelligence Display**
   - [ ] `app/components/conferences/SpeakerCompanyStats.tsx`
     - Group speakers by company
     - Show company counts
     - Show industry distribution
     - Show seniority patterns

4. **Competitive Insights Display**
   - [ ] `app/components/conferences/CompetitorExhibitors.tsx`
     - Highlight competitor exhibitors
     - Show sponsorship tiers

**Estimated Time:** 12-15 hours  
**Dependencies:** Phase 3, Phase 6

---

## Phase 8: Speaker Intelligence Features

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

## Phase 9: Company Search & Intelligence

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
     - Show tier and estimated cost per conference
     - Show total estimated annual spend
   
   - [ ] `app/components/companies/SpeakerHistory.tsx`
     - List conferences where company had speakers
     - Show speaker count per conference
     - Show roles/industries
   
   - [ ] `app/components/companies/SpendEstimation.tsx`
     - Display spend range (low, high)
     - Show breakdown by conference
     - Indicate which estimates are known vs inferred
     - Show "Unknown" for conferences without tier data

4. **Spend Estimation Display**
   - [ ] Visualize spend data
   - [ ] Show confidence indicators
   - [ ] Display methodology disclaimer

**Estimated Time:** 12-15 hours  
**Dependencies:** Phase 3, Phase 4

---

## Phase 10: Bookmarking System

### Tasks

1. **Authentication Setup**
   - [ ] Set up Supabase Auth
   - [ ] Create login/signup pages
   - [ ] Create auth context/provider
   - [ ] Protect bookmark routes

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

**Estimated Time:** 6-8 hours  
**Dependencies:** Phase 1, Phase 3, Phase 6

---

## Phase 11: Admin Interface

### Tasks

1. **Admin Authentication**
   - [ ] Create admin role check
   - [ ] Protect admin routes
   - [ ] Create admin layout

2. **Admin Dashboard**
   - [ ] `app/admin/page.tsx`
     - Overview stats
     - Recent crawls
     - Recent email outreach
     - Data completeness metrics

3. **Crawl Management**
   - [ ] `app/admin/crawl/page.tsx`
     - Manual crawl trigger
     - View crawl logs
     - View crawl queue
     - Retry failed crawls

4. **Email Outreach Management**
   - [ ] `app/admin/email-outreach/page.tsx`
     - Manual email trigger
     - View outreach logs
     - Resend failed emails

5. **Conference Management**
   - [ ] `app/admin/conferences/page.tsx`
     - List all conferences
     - Edit conference data
     - Delete conferences
     - Bulk operations

6. **Data Quality Tools**
   - [ ] `app/admin/data-quality/page.tsx`
     - View low-completeness conferences
     - Flag for re-crawl
     - Manual data entry forms

**Estimated Time:** 15-20 hours  
**Dependencies:** Phase 3, Phase 4, Phase 5

---

## Phase 12: Testing & Deployment

### Tasks

1. **Unit Tests**
   - [ ] Test repositories
   - [ ] Test services (crawler, email, spend estimation)
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

**Estimated Time:** 15-20 hours  
**Dependencies:** All previous phases

---

## Summary

### Total Estimated Time: 135-175 hours (~3.5-4.5 weeks full-time)

### Critical Path Dependencies:
1. Phase 0 → Phase 1 → Phase 2 → Phase 3 (Foundation)
2. Phase 1 → Phase 4 (Crawler needs DB)
3. Phase 2 → Phase 6, 7, 8, 9 (Frontend needs repositories)
4. Phase 3 → Phase 6, 7, 8, 9 (Frontend needs APIs)
5. Phase 4 → Phase 9 (Company intelligence needs crawler data)

### Recommended Development Order:
1. **Week 1:** Phases 0, 1, 2, 3 (Foundation + APIs)
2. **Week 2:** Phases 4, 5 (Agents)
3. **Week 3:** Phases 6, 7, 8 (Frontend core features)
4. **Week 4:** Phases 9, 10, 11, 12 (Advanced features + polish)

### Key Technical Decisions:
- **Web Crawling:** Use Puppeteer or Playwright (Playwright recommended for better reliability)
- **Email:** Use Resend (modern, developer-friendly)
- **PDF Parsing:** Use `pdf-parse` or `pdfjs-dist`
- **Company Enrichment:** Start with manual mapping, add APIs later if needed
- **Spend Estimation:** Start simple, refine with real data

### Risk Mitigation:
- **Crawler Reliability:** Build robust error handling, retry logic, and fallback strategies
- **Data Quality:** Implement confidence scores and manual review workflows
- **Performance:** Use database indexes, pagination, and caching from the start
- **Compliance:** Ensure robots.txt compliance and ethical crawling practices

---

## Next Steps

1. Review and approve this development plan
2. Set up project repository and initial structure
3. Begin Phase 0: Project Setup & Infrastructure
4. Create detailed task tickets for each phase (if using project management tool)

