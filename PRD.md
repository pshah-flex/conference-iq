# Product Requirements Document (PRD)

## Conference IQ

_Please paste your PRD content below this line. Once you've added it, I'll create a comprehensive development plan for you._

---

Absolutely — here is an updated **Cursor-ready PRD (V1.3)** with the two new V1 functionality additions fully integrated:

### ✅ **Speaker + Company Intelligence Extraction**

### ✅ **Company Search → Exhibitor History + Estimated Spend**

### (Spend = descriptive estimate based on public sponsor tiers; no ROI modeling)

Everything is structured so Cursor can generate DB schemas, backend endpoints, frontend pages, and agents that support this functionality.

---

# **📄 PRD: Conference Intelligence Platform (V1.3)**

*Updated with Speaker Intelligence + Company Spend Estimation*
*Vercel + Supabase Implementation*

---

# **1. Overview**

This platform provides Sales and Marketing leaders with a centralized, continuously updated dataset of global conferences.

The system uses:

* Automated web-crawling agents
* Automated email outreach agents
* A structured conference directory
* Descriptive insights (no ROI)
* Bookmarking
* Company intelligence: exhibitor history + spend estimates
* Speaker intelligence: who the speakers are and what companies they’re from

---

# **2. Users & Personas**

**Sales & BD Leaders, Marketing Leadership, RevOps, Event Managers**

---

# **3. Problems This Solves**

* No centralized source for conference data
* Missing exhibitor, pricing, speaker lists
* Difficult to understand competitor event activity
* No unified way to analyze which companies invest heavily in conferences
* No easy way to understand the types of companies represented onstage

---

# **4. Goals & Non-Goals**

## **4.1 Goals (V1)**

* Searchable, normalized conference dataset
* Web crawling + email outreach agents
* Descriptive insights
* Exhibitor intelligence
* **Speaker intelligence (new)**
* **Company search → exhibitor history + spend estimate (new)**
* Bookmarks
* Deploy with Vercel + Supabase

## **4.2 Non-Goals (V1)**

* ROI modeling
* Comparison tool
* Predictive scoring or forecasting
* CRM integrations
* Attendee PII

---

# **5. Core Features**

---

## **5.1 Conference Database**

### **Data Fields**

* Name, URL
* Dates
* City, country
* Industry
* Attendance estimate
* Exhibitor list
* **Speaker list (names, titles, companies)**
* **Speaker company intelligence (aggregated across conferences)**
* Agenda
* Pricing (ticket, sponsor tiers)
* Organizer contact info
* Data completeness score
* Confidence scores
* Timestamps (crawl / verify / update)

---

## **5.2 Conference Detail Page**

### Shows:

* Dates, location
* Attendance estimate
* Exhibitor list (with competitor tagging)
* **Speaker list** (name, title, company)
* **Speaker company counts** (how many speakers from each company)
* Pricing data
* Agenda
* Data completeness
* Source provenance
* Email outreach activity

---

## **5.3 Attendee Demographic Intelligence**

Uses public info (speakers, LinkedIn event page, etc.) to infer:

* Role seniority
* Industries
* Company sizes

No PII.

---

## **5.4 Competitive Exhibitor Insights**

* Competitor tagging
* Sponsorship tier detection (if explicit)
* Historical presence frequency

---

## **5.5 NEW: Speaker Intelligence**

### **Purpose**

Provide users visibility into which companies are represented on stage and what types of roles speak at each conference.

### **Data Extracted**

* Speaker name (public)
* Title
* Company
* Company industry
* Company size (if inferable from public sources)

### **System Features**

* Group speakers by company
* Count number of speakers per company
* Show company industry distribution
* Identify seniority patterns (VP-heavy, IC-heavy, C-suite-heavy)

### **Uses**

* Validate audience relevance
* Identify companies investing heavily in thought leadership
* Understand conference positioning

---

## **5.6 NEW: Company Search — Exhibitor History + Estimated Spend**

### **Purpose**

Allow users to search any company and see:

1. **Which conferences they have exhibited at**
2. **Which conferences they have spoken at**
3. **Estimated annual conference spend (descriptive only)**

### **Spend Estimation Logic (All Descriptive)**

Spend estimate is *not* an ROI or financial model — it is purely descriptive and based on public data:

* If exhibitor tier is publicly listed (“Gold Sponsor — $25,000”), use provided number
* If pricing PDF is available, extract tier costs
* If tier name appears with no number (“Platinum Sponsor”), estimate cost based on:

  * Average cost for similar tiers in the same industry
  * Historical sponsor deck data
  * Agent-inferred tier pricing ranges
* If tier cannot be inferred, mark cost as “Unknown”

### **Outputs**

For Company X:

* Conferences they exhibited at
* Exhibitor tier
* Estimated spend per tier
* Total spend estimate (sum of known estimates; unknowns excluded)
* Conferences where they had speakers
* Conferences where they had both exhibitors *and* speakers

### **User Value**

* Competitor intelligence
* Market understanding
* Budget benchmarking (“Competitor X likely spending $350k–$500k annually on conferences”)

---

# **6. Data Acquisition Agents**

Unchanged except now agents also extract:

* Speakers
* Speaker titles
* Speaker companies
* Exhibitor tier labels (for spend estimation)

### Agent now populates:

* `speakers_json`
* `speaker_companies_json`
* `exhibitor_tier_parsed`
* `estimated_sponsor_cost_range`

---

# **7. Technical Requirements**

---

# **7.1 Infrastructure (Confirmed)**

### Using:

* **Vercel** (frontend + API routes + hosting)
* **Supabase** (database, auth, row-level security, storage)
* **Supabase Edge Functions** (optional for long-running background tasks)
* **Supabase Storage** (raw HTML, PDFs, email attachments)

---

# **7.2 Data Models (Updated for Speakers + Company Spend)**

### `speakers`

* id (uuid)
* conference_id
* name
* title
* company
* company_industry
* company_size_bucket
* source_url
* confidence_score
* created_at

### `exhibitors`

* id (uuid)
* conference_id
* company_name
* exhibitor_tier_raw
* exhibitor_tier_normalized
* estimated_cost_low
* estimated_cost_high
* source_url
* confidence_score
* created_at

### `company_exhibitor_index` (materialized view or table)

* company_name
* conference_ids (array)
* exhibitor_tiers (array)
* estimated_annual_spend_low
* estimated_annual_spend_high

### `company_speaker_index` (view)

* company_name
* conference_ids (array)
* speaker_count
* roles (array)
* industries (array)

---

# **7.3 New API Endpoints**

### Company Intelligence

* `GET /companies/search?q=ACME`
* `GET /company/:companyName/exhibitors`
* `GET /company/:companyName/speakers`

---

# **8. Success Metrics**

Primary:

* Accuracy of speaker extraction
* Extraction success rates for exhibitor tiers
* Number of companies searched
* Completeness of company intelligence profiles

---

# **9. Compliance**

No speaker PII (only public names/titles posted publicly on conference sites).
No scraping private attendee lists.
Ethical crawler settings and robots.txt compliance.

---

# **10. MVP Scope (Final)**

### **Included**

* Conference directory
* Conference detail pages
* Web crawling agent
* Email outreach agent
* Bookmarking
* Speaker intelligence
* Company search + exhibitor history
* Spend estimation (descriptive, tier-based)
* Vercel + Supabase deployment
* Admin interface

### **Not Included**

* Comparison tool
* ROI prediction
* CRM data ingestion
* Budget planning

---

# **End of PRD (V1.3)**
