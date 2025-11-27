# Post-MVP Backlog: Conference IQ

This document contains features and enhancements that are deferred beyond the MVP scope. These can be prioritized and implemented based on user feedback and business needs after launch.

---

## 🔄 Deferred Features

### 1. Email Outreach Agent

**Original Phase:** Phase 5 (removed from MVP)  
**Estimated Time:** 8-10 hours  
**Priority:** Medium

**Description:**
Automated email outreach to conference organizers to request missing data.

**Tasks:**
- [ ] Configure email provider (Resend)
- [ ] Set up email templates
- [ ] Create `lib/services/email-service.ts`
- [ ] Create email templates for conference data request
- [ ] Personalize with conference name, organizer name
- [ ] Create `lib/services/email-outreach-service.ts`
  - Find conferences missing data
  - Generate personalized emails
  - Send emails via Resend
  - Log outreach attempts
  - Handle bounces and failures
- [ ] Basic email response parsing (if responses come in)
- [ ] Extract data from email attachments
- [ ] Admin interface integration
  - Manual trigger for email outreach
  - View outreach logs
  - Resend failed emails
- [ ] Create `email_outreach_logs` table in database

**Rationale for Deferral:**
- Not core to user value proposition
- Can manually reach out to conferences initially
- Adds complexity with email templates, parsing, bounce handling
- Can validate need after MVP launch

---

### 2. Attendee Demographic Intelligence

**Original Section:** PRD Section 5.3  
**Estimated Time:** 5-8 hours  
**Priority:** Low

**Description:**
Use public info (speakers, LinkedIn event page, etc.) to infer:
- Role seniority
- Industries
- Company sizes

**Tasks:**
- [ ] Create demographic inference service
- [ ] Integrate with LinkedIn API or similar (if available)
- [ ] Create demographic analysis algorithms
- [ ] Display demographic insights on conference detail pages
- [ ] Add demographic filters to conference directory

**Rationale for Deferral:**
- Requires inference logic and external data sources
- Not essential for core value
- Can be added later with better data
- Users can judge audience from speakers/exhibitors directly

---

### 3. Advanced Speaker Intelligence

**Original Phase:** Phase 8 (simplified for MVP)  
**Estimated Time:** 5-6 hours  
**Priority:** Medium

**Description:**
Advanced analysis of speaker data including seniority patterns and industry distribution.

**Tasks:**
- [ ] `app/components/speakers/SeniorityPatterns.tsx`
  - Categorize titles (C-suite, VP, Director, IC, etc.)
  - Display distribution
  - Identify patterns (VP-heavy, IC-heavy, etc.)
- [ ] `app/components/speakers/IndustryDistribution.tsx`
  - Show industries represented by speakers
  - Visualize distribution with charts
- [ ] Add filters: by title, by industry
- [ ] Add `getSeniorityPatterns(conferenceId)` to speaker repository
- [ ] Visualize with charts (recharts or similar)

**Rationale for Deferral:**
- MVP includes basic company grouping which covers core need
- Advanced analysis can be added based on user feedback
- Charts and visualizations add complexity

---

### 4. Complex Spend Estimation

**Original Phase:** Part of Phase 4 (simplified for MVP)  
**Estimated Time:** 4-5 hours  
**Priority:** Medium

**Description:**
Advanced spend estimation with tier inference, industry averages, and cost ranges.

**Tasks:**
- [ ] Enhance `lib/services/spend-estimation.ts`
  - Infer tier costs from normalized tier names
  - Use industry averages for unknown tiers
  - Return cost ranges (low, high)
  - Historical sponsor deck analysis
- [ ] Update database schema:
  - Add `estimated_cost_low` and `estimated_cost_high` to exhibitors table
- [ ] Update company intelligence to show spend ranges
- [ ] Display confidence indicators
- [ ] Display methodology disclaimer

**Rationale for Deferral:**
- MVP shows explicit costs which is most reliable
- Estimation logic requires industry data and validation
- Can add after gathering real-world data
- Users can see explicit costs and judge themselves

---

### 5. Confidence Scores

**Original Phase:** Part of Phase 1 (removed from MVP)  
**Estimated Time:** 2-3 hours  
**Priority:** Low

**Description:**
Confidence scores for extracted data to indicate data quality.

**Tasks:**
- [ ] Add `confidence_score` column to `speakers` table
- [ ] Add `confidence_score` column to `exhibitors` table
- [ ] Create confidence scoring algorithm
- [ ] Display confidence scores in UI
- [ ] Filter by confidence level

**Rationale for Deferral:**
- Adds complexity without immediate user value
- Can add later if data quality becomes an issue
- Users can judge data quality themselves from source URLs

---

### 6. Full Agenda Parsing

**Original Phase:** Part of Phase 4 (simplified for MVP)  
**Estimated Time:** 3-4 hours  
**Priority:** Low

**Description:**
Extract and parse full agenda/schedule information from conference websites.

**Tasks:**
- [ ] `lib/services/crawler/extractors/agenda.ts`
  - Extract full agenda/schedule information
  - Parse session/schedule breakdown
  - Extract time slots
  - Extract session titles and descriptions
- [ ] Create `agenda_sessions` table
- [ ] Display parsed agenda on conference detail page
- [ ] Add agenda search/filter functionality

**Rationale for Deferral:**
- MVP stores agenda URL which is sufficient
- Full parsing is complex and varies by website
- Users can click through to conference website for agenda
- Can add if users request it

---

### 7. Competitor Tagging

**Original Phase:** Part of Phase 7 (removed from MVP)  
**Estimated Time:** 2-3 hours  
**Priority:** Medium

**Description:**
Tag exhibitors as competitors and highlight them in the UI.

**Tasks:**
- [ ] Add `is_competitor` column to `exhibitors` table (already in schema, just needs UI)
- [ ] Create admin interface for competitor management
- [ ] `app/components/conferences/CompetitorExhibitors.tsx`
  - Highlight competitor exhibitors
  - Show sponsorship tiers for competitors
- [ ] Add competitor filter to exhibitor lists
- [ ] Add competitor insights to company profiles

**Rationale for Deferral:**
- Requires manual setup or ML
- Not essential for MVP
- Can add as admin feature after launch
- Users can identify competitors themselves

---

### 8. Advanced Admin Dashboard

**Original Phase:** Part of Phase 11 (simplified for MVP)  
**Estimated Time:** 8-10 hours  
**Priority:** Medium

**Description:**
Comprehensive admin dashboard with stats, analytics, and advanced management tools.

**Tasks:**
- [ ] `app/admin/page.tsx` (full dashboard)
  - Overview stats (total conferences, completeness metrics, etc.)
  - Recent crawls with success rates
  - Recent email outreach (if implemented)
  - Data completeness metrics
  - System health indicators
- [ ] `app/admin/data-quality/page.tsx`
  - View low-completeness conferences
  - Flag for re-crawl
  - Manual data entry forms
  - Bulk data updates
- [ ] Bulk operations for conferences
- [ ] Advanced crawl queue management
- [ ] Retry failed crawls with improved error handling
- [ ] Analytics and reporting

**Rationale for Deferral:**
- MVP includes basic CRUD which is sufficient for launch
- Advanced features can be added based on admin needs
- Stats and analytics less critical for initial launch

---

### 9. Company Intelligence Materialized Views

**Original Phase:** Part of Phase 1 (simplified for MVP)  
**Estimated Time:** 2-3 hours  
**Priority:** Low

**Description:**
Materialized views for optimized company intelligence queries.

**Tasks:**
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
- [ ] Set up refresh schedules for materialized views
- [ ] Update company intelligence queries to use views

**Rationale for Deferral:**
- Simple SQL queries work fine for MVP scale
- Can optimize later if performance becomes an issue
- Materialized views add maintenance overhead

---

### 10. Company Enrichment via APIs

**Original Phase:** Part of Phase 4 (simplified for MVP)  
**Estimated Time:** 3-4 hours  
**Priority:** Low

**Description:**
Automatic company enrichment using external APIs (Clearbit, etc.).

**Tasks:**
- [ ] Integrate with Clearbit API or similar
- [ ] Enrich speaker companies with industry/size data
- [ ] Auto-detect company industry
- [ ] Auto-detect company size from public data
- [ ] Cache enrichment data
- [ ] Handle API rate limits
- [ ] Fallback to manual mapping if API fails

**Rationale for Deferral:**
- MVP uses manual mapping which is sufficient
- External APIs add cost and complexity
- Can add if manual process becomes bottleneck
- Manual mapping ensures accuracy

---

### 11. Source Provenance Tracking

**Original Phase:** Part of Phase 1 (simplified for MVP)  
**Estimated Time:** 1-2 hours  
**Priority:** Low

**Description:**
Detailed provenance tracking for data sources.

**Tasks:**
- [ ] Create provenance tracking system
- [ ] Track multiple sources for same data point
- [ ] Display detailed source attribution
- [ ] Show source confidence and reliability
- [ ] Track source updates over time

**Rationale for Deferral:**
- MVP stores source URL which is sufficient
- Complex provenance adds overhead
- Can add if users need detailed source tracking

---

### 12. Advanced Data Completeness Scoring

**Original Phase:** Part of Phase 1 (simplified for MVP)  
**Estimated Time:** 2-3 hours  
**Priority:** Low

**Description:**
Weighted scoring algorithm for data completeness instead of simple field count.

**Tasks:**
- [ ] Create weighted importance system for fields
- [ ] Implement scoring algorithm
- [ ] Update `updateCompletenessScore(id)` method
- [ ] Display weighted scores in UI
- [ ] Add scoring explanations

**Rationale for Deferral:**
- Simple field count is sufficient for MVP
- Weighted scoring requires validation of weights
- Can add if users need more nuanced completeness indicators

---

## 📊 Backlog Summary

### By Priority

**High Priority (Post-MVP, but important):**
- None currently - all features can wait

**Medium Priority:**
1. Email Outreach Agent
2. Advanced Speaker Intelligence
3. Complex Spend Estimation
4. Competitor Tagging
5. Advanced Admin Dashboard

**Low Priority:**
1. Attendee Demographic Intelligence
2. Confidence Scores
3. Full Agenda Parsing
4. Company Intelligence Materialized Views
5. Company Enrichment via APIs
6. Source Provenance Tracking
7. Advanced Data Completeness Scoring

### Estimated Total Backlog Time
**~40-55 hours** of additional development work

### Implementation Strategy

1. **Launch MVP** and gather user feedback
2. **Prioritize backlog** based on:
   - User requests
   - Business value
   - Technical complexity
   - Data availability
3. **Implement incrementally** - one feature at a time
4. **Validate each addition** before moving to next

---

## 🔄 Future Considerations

These are ideas that may be considered in the future but are not yet defined:

- **Comparison Tool** - Compare multiple conferences side-by-side
- **ROI Prediction** - Predictive models for conference ROI (explicitly out of scope per PRD)
- **CRM Integrations** - Connect with Salesforce, HubSpot, etc.
- **Budget Planning** - Tools for planning conference budgets
- **Attendee PII** - Private attendee data (explicitly out of scope per PRD)
- **API Access** - Public API for programmatic access
- **Bulk Exports** - Export conference data in various formats
- **Mobile App** - Native mobile applications
- **Real-time Updates** - WebSocket-based real-time data updates
- **Collaboration Features** - Team workspaces, shared bookmarks, notes

---

## 📝 Notes

- All backlog items should be re-evaluated after MVP launch
- User feedback should drive prioritization
- Some features may become unnecessary after launch
- Technical debt from simplifications should be addressed incrementally
- Performance optimizations (views, caching) should be added as needed

