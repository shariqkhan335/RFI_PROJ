Fully implement the following analysis framework for this grant data.


# FEDERAL GRANTS & CONTRIBUTIONS ANALYSIS FRAMEWORK

## Alberta Recipients Focus

### User Interface Design & Control Specification

**Version 1.0**  
**January 2026**

---

## Table of Contents

1. Executive Summary
2. Analysis Dimensions Overview
3. Primary Filter Controls
4. Financial Analysis Framework
5. Temporal Analysis Framework
6. Geographic Analysis Framework
7. Recipient Analysis Framework
8. Program & Policy Analysis Framework
9. Risk & Accountability Framework
10. Equity & Access Analysis Framework
11. Operational Efficiency Framework
12. Data Quality Assessment Framework
13. Key Performance Indicators Dashboard
14. Alert & Anomaly Detection Rules
15. Implementation Specifications
- Appendix A: Data Field Reference
- Appendix B: Filter Logic Specifications

---

## 1. Executive Summary

This framework provides a comprehensive analytical structure for examining federal grants and contributions data with a focus on Alberta recipients. It defines the controls, filters, search criteria, and analytical views necessary to identify spending patterns, anomalies, compliance issues, and opportunities for program enhancement.

The framework is organized around eight core analysis dimensions, each with specific metrics, filter controls, and alert thresholds. Implementation of this framework will enable systematic review of federal transfer payments flowing to Alberta organizations, supporting evidence-based policy recommendations and oversight activities.

### 1.1 Framework Objectives

- Enable multi-dimensional analysis of grants and contributions spending patterns
- Identify anomalies, risks, and potential issues in federal funding distribution
- Support compliance monitoring and accountability assessment
- Facilitate geographic and demographic equity analysis
- Provide actionable insights for program enhancement recommendations
- Ensure data quality visibility and improvement tracking

### 1.2 Data Source

Primary data source: Canada Open Data Portal - Grants and Contributions Dataset (Resource ID: 1d15a62f-5656-49ad-8c88-f40ce689d831). This dataset contains over 1.2 million records across all federal departments and agencies.

---

## 2. Analysis Dimensions Overview

The framework is built around eight interconnected analysis dimensions. Each dimension addresses specific analytical questions and supports distinct oversight objectives.

| Dimension | Primary Focus | Key Questions |
|-----------|---------------|---------------|
| Financial | Spending amounts, distributions, and value patterns | Where is money concentrated? Are amounts appropriate? |
| Temporal | Timing patterns, fiscal cycles, project durations | When does spending occur? Are timelines realistic? |
| Geographic | Regional distribution, urban/rural balance | Is funding equitably distributed across Alberta? |
| Recipient | Organization types, repeat funding, capacity | Who receives funds? Is there concentration? |
| Program/Policy | Program effectiveness, policy alignment | Are programs achieving intended outcomes? |
| Risk/Accountability | Compliance, amendments, audit concerns | What indicators suggest elevated risk? |
| Equity/Access | Barrier analysis, underserved populations | Are all communities able to access programs? |
| Operational | Processing efficiency, administrative burden | How efficiently are programs administered? |

---

## 3. Primary Filter Controls

These filters form the foundation of the user interface, allowing users to scope their analysis before applying dimension-specific views.

### 3.1 Geographic Scope Filters

| Filter Name | Control Type | Data Field | Default Value |
|-------------|--------------|------------|---------------|
| Province/Territory | Dropdown (single) | recipient_province | AB (Alberta) |
| City/Municipality | Multi-select with search | recipient_city | All |
| Postal Code Prefix | Text input (pattern) | recipient_postal_code | All T* codes |
| Federal Riding | Multi-select with search | federal_riding_name_en | All |
| Urban/Rural Classification | Checkbox group | Derived from postal code | All |

### 3.2 Temporal Scope Filters

| Filter Name | Control Type | Data Field | Default Value |
|-------------|--------------|------------|---------------|
| Fiscal Year | Multi-select dropdown | Derived from agreement_start_date | Current + Previous 4 |
| Agreement Start Date Range | Date range picker | agreement_start_date | Last 5 years |
| Agreement End Date Range | Date range picker | agreement_end_date | All |
| Quarter | Checkbox group (Q1-Q4) | Derived from agreement_start_date | All |
| Active/Completed Status | Radio buttons | Derived from dates | All |

### 3.3 Financial Scope Filters

| Filter Name | Control Type | Data Field | Default Value |
|-------------|--------------|------------|---------------|
| Agreement Value Range | Dual slider with inputs | agreement_value | $0 - Maximum |
| Value Tier | Checkbox group | Derived from agreement_value | All tiers |
| Agreement Type | Checkbox group | agreement_type (G/C/O) | All |

#### Value Tier Definitions

- **Micro:** Under $25,000
- **Small:** $25,000 - $99,999
- **Medium:** $100,000 - $499,999
- **Large:** $500,000 - $999,999
- **Major:** $1,000,000 - $4,999,999
- **Mega:** $5,000,000+

### 3.4 Program & Department Filters

| Filter Name | Control Type | Data Field | Default Value |
|-------------|--------------|------------|---------------|
| Federal Department/Agency | Multi-select with search | owner_org_title | All |
| Program Name | Multi-select with search | prog_name_en | All |
| NAICS Industry Code | Hierarchical multi-select | naics_identifier | All |
| Keyword Search | Text input with operators | description_en, agreement_title_en | Empty |

### 3.5 Recipient Filters

| Filter Name | Control Type | Data Field | Default Value |
|-------------|--------------|------------|---------------|
| Recipient Name | Text search with autocomplete | recipient_legal_name, recipient_operating_name | All |
| Recipient Type | Checkbox group | recipient_type | All |
| Business Number | Text input | recipient_business_number | Empty |

---

## 4. Financial Analysis Framework

This dimension examines spending amounts, distribution patterns, and financial anomalies to identify concentration, outliers, and potential issues in funding allocation.

### 4.1 Key Metrics

| Metric | Calculation | Alert Threshold |
|--------|-------------|-----------------|
| Total Funding Value | SUM(agreement_value) for filtered records | Trend variance > 20% YoY |
| Average Agreement Size | AVG(agreement_value) | Deviation > 2 std from program mean |
| Median Agreement Size | MEDIAN(agreement_value) | Mean/Median ratio > 3 |
| Funding Concentration (HHI) | Herfindahl-Hirschman Index by recipient | HHI > 2500 (high concentration) |
| Top 10 Recipient Share | Sum of top 10 recipients / Total | > 50% concentration |
| Value Tier Distribution | Count and sum by value tier | Any tier > 60% of total value |
| Agreement Type Mix | Proportion G vs C vs O | Significant shift from historical |

### 4.2 Visualization Components

- **Histogram:** Distribution of agreement values with log scale option
- **Box Plot:** Value distribution by program, department, or recipient type
- **Treemap:** Funding allocation hierarchy (Department > Program > Recipient)
- **Pareto Chart:** Cumulative funding concentration by recipient
- **Stacked Bar:** Agreement type composition over time
- **Scatter Plot:** Agreement value vs. project duration

### 4.3 Anomaly Detection Rules

- Flag agreements > 3 standard deviations from program mean value
- Flag agreements at exactly round numbers ($100,000, $500,000) for potential arbitrary pricing
- Flag unusual value patterns: identical amounts to same recipient across programs
- Flag agreements just below reporting thresholds (e.g., $24,999 vs $25,000)

---

## 5. Temporal Analysis Framework

This dimension examines timing patterns to identify fiscal year-end spending spikes, unrealistic project timelines, and seasonal anomalies.

### 5.1 Key Metrics

| Metric | Calculation | Alert Threshold |
|--------|-------------|-----------------|
| Q4 Spending Ratio | Q4 (Jan-Mar) value / Annual total | > 35% (fiscal year-end spike) |
| March Spending Ratio | March value / Q4 total | > 50% of Q4 in March alone |
| Average Project Duration | AVG(agreement_end_date - agreement_start_date) | < 90 days for large agreements |
| Short Project Rate | % of agreements < 6 months duration | > 40% for contribution agreements |
| Amendment Frequency | Agreements with amendments / Total | > 25% amendment rate |
| Extension Rate | % with end date amendments | > 30% require extensions |
| YoY Growth Rate | (Current Year - Prior Year) / Prior Year | Variance > 25% from 5-year trend |

### 5.2 Visualization Components

- **Time Series:** Monthly/quarterly spending trends with fiscal year markers
- **Calendar Heatmap:** Daily agreement initiation patterns
- **Duration Histogram:** Project length distribution
- **Gantt View:** Agreement timelines for selected recipients/programs
- **Seasonal Decomposition:** Trend, seasonal, and residual components
- **Cohort Analysis:** Funding patterns by agreement start year

### 5.3 Anomaly Detection Rules

- Flag projects starting in final week of fiscal year with duration < 30 days
- Flag multiple amendments within 90 days of agreement start
- Flag agreements with end dates before expected deliverable timelines
- Flag programs with > 50% of annual funding in final month

---

## 6. Geographic Analysis Framework

This dimension examines the spatial distribution of funding to assess regional equity, identify underserved areas, and analyze urban/rural balance within Alberta.

### 6.1 Key Metrics

| Metric | Calculation | Alert Threshold |
|--------|-------------|-----------------|
| Per Capita Funding | Total funding / Population by region | Variance > 50% from provincial avg |
| Urban/Rural Ratio | Urban funding / Rural funding | Ratio > 5:1 (population-adjusted) |
| Regional Distribution Index | Gini coefficient of funding by census division | Gini > 0.6 (high inequality) |
| Calgary/Edmonton Share | Metro funding / Alberta total | > 85% (over-concentration) |
| Northern Alberta Share | Northern region funding / Total | < 10% (potential underservice) |
| Riding-Level Variance | Std deviation of per-capita funding by riding | Coefficient of variation > 1.0 |

### 6.2 Geographic Classifications

The framework uses the following geographic hierarchy for Alberta analysis:

- **Metro:** Calgary CMA, Edmonton CMA
- **Urban:** Cities with population > 50,000 (Red Deer, Lethbridge, etc.)
- **Suburban:** Communities within 50km of metro areas
- **Rural:** Agricultural and small community areas
- **Remote/Northern:** Areas north of 55th parallel or without year-round road access
- **Indigenous:** First Nations reserves and Metis Settlements

### 6.3 Visualization Components

- **Choropleth Map:** Per-capita funding by census division/federal riding
- **Bubble Map:** Agreement locations sized by value
- **Flow Map:** Department headquarters to recipient locations
- **Comparison Bar:** Urban vs. rural funding trends
- **Dot Density:** Agreement distribution overlaid on population density

---

## 7. Recipient Analysis Framework

This dimension profiles funding recipients to identify concentration patterns, repeat relationships, organizational capacity indicators, and potential conflicts of interest.

### 7.1 Key Metrics

| Metric | Calculation | Alert Threshold |
|--------|-------------|-----------------|
| Unique Recipient Count | COUNT(DISTINCT recipient_legal_name) | Declining trend |
| Repeat Recipient Rate | Recipients with > 1 agreement / Total | > 60% repeat rate |
| New Recipient Rate | First-time recipients / Total recipients | < 15% new recipients annually |
| Multi-Program Recipients | Recipients receiving from 3+ programs | > 20% (potential stacking) |
| Multi-Dept Recipients | Recipients receiving from 3+ departments | > 15% (coordination check) |
| Avg Agreements Per Recipient | Total agreements / Unique recipients | > 5 avg (high repeat rate) |
| Recipient Type Distribution | Funding by recipient_type category | Single type > 70% |

### 7.2 Recipient Profile Components

For each recipient, the system should generate a comprehensive profile including:

- **Funding History:** Timeline of all agreements with values and programs
- **Department Relationships:** Which federal departments have funded this recipient
- **Program Participation:** Cross-program funding patterns
- **Geographic Footprint:** Locations associated with recipient projects
- **Amendment History:** Pattern of contract modifications
- **Performance Indicators:** Project completion rates, extension frequency
- **Related Entities:** Other organizations at same address or with similar names

### 7.3 Anomaly Detection Rules

- Flag recipients receiving > $1M annually across multiple programs
- Flag new recipients receiving unusually large first agreements
- Flag recipients with high amendment rates (> 40% of agreements)
- Flag multiple recipients at identical addresses
- Flag recipients with missing business numbers on large agreements

---

## 8. Program & Policy Analysis Framework

This dimension evaluates program effectiveness, policy alignment, outcome clarity, and identifies opportunities for program enhancement.

### 8.1 Key Metrics

| Metric | Calculation | Alert Threshold |
|--------|-------------|-----------------|
| Program Count by Department | COUNT(DISTINCT prog_name_en) by owner_org | > 50 programs (fragmentation) |
| Program Overlap Score | Similarity analysis of program descriptions | > 80% similarity between programs |
| Description Quality Score | % with specific vs. generic descriptions | > 50% generic/boilerplate |
| Expected Results Clarity | % with measurable outcome statements | < 40% measurable outcomes |
| Program Continuity Rate | Programs active > 5 years / Total | Review programs > 10 years |
| Alberta Share by Program | Alberta funding / National program total | < 8% (under population share) |

### 8.2 Program Profile Components

- **Objective Analysis:** Stated program purpose and alignment with policy priorities
- **Outcome Framework:** Expected results and measurability assessment
- **Recipient Diversity:** Range of organization types receiving funding
- **Geographic Reach:** Distribution across Alberta regions
- **Funding Trends:** Multi-year spending patterns
- **Similar Programs:** Cross-reference with potentially overlapping initiatives

### 8.3 Enhancement Opportunity Indicators

- Programs with vague or unmeasurable expected results
- Programs with high concentration among few recipients
- Programs with declining new recipient rates
- Programs with significant regional gaps in coverage
- Programs with similar mandates to other departmental programs

---

## 9. Risk & Accountability Framework

This dimension identifies indicators of elevated risk, compliance concerns, and accountability gaps in grants and contributions administration.

### 9.1 Risk Scoring Model

Each agreement receives a composite risk score (0-100) based on weighted risk factors:

| Risk Factor | Indicator | Weight | Max Points |
|-------------|-----------|--------|------------|
| Agreement Value | Higher = higher risk | 15% | 15 |
| First-Time Recipient | New = higher risk | 10% | 10 |
| Amendment History | More amendments = higher risk | 15% | 15 |
| Project Duration | Very short or very long = risk | 10% | 10 |
| Fiscal Year-End Timing | March start = higher risk | 10% | 10 |
| Data Completeness | Missing fields = higher risk | 10% | 10 |
| Multi-Source Funding | Stacking indicators | 10% | 10 |
| Outcome Clarity | Vague outcomes = higher risk | 10% | 10 |
| Historical Performance | Prior issues with recipient | 10% | 10 |

### 9.2 Risk Tier Classification

- **Low Risk (0-25):** Standard monitoring
- **Moderate Risk (26-50):** Enhanced review recommended
- **Elevated Risk (51-75):** Active monitoring required
- **High Risk (76-100):** Priority review and potential audit flag

### 9.3 Accountability Indicators

- Agreements without clear deliverables in description
- Agreements missing expected results content
- Recipients with incomplete profile data (missing business number, type)
- Programs with generic, repeated description text
- Agreements with multiple value amendments (scope creep indicator)

---

## 10. Equity & Access Analysis Framework

This dimension examines whether programs are accessible to all eligible applicants and whether funding reaches intended beneficiary populations.

### 10.1 Key Metrics

| Metric | Calculation | Alert Threshold |
|--------|-------------|-----------------|
| Indigenous Organization Share | Funding to Indigenous recipients / Total | < 5% (review for gaps) |
| Small Organization Share | Funding to orgs < $100K revenue / Total | < 10% (barrier indicator) |
| Rural Community Share | Rural area funding / Total | < 15% (underservice risk) |
| Francophone Organization Share | Funding to OLM communities / Total | < Population proportion |
| Average Agreement Size by Region | AVG(value) by geographic classification | Urban avg > 3x rural avg |
| New Recipient Geographic Distribution | First-time recipients by region | > 80% metro concentration |

### 10.2 Barrier Analysis Components

- **Application Complexity:** Programs with high administrative requirements
- **Matching Requirements:** Programs requiring significant co-funding
- **Minimum Thresholds:** Programs with high minimum agreement values
- **Eligibility Restrictions:** Programs limiting recipient types
- **Reporting Burden:** Programs with disproportionate reporting relative to value

### 10.3 Equity Dashboard Views

- **Side-by-Side:** Program access rates by community type
- **Gap Analysis:** Funding per capita by demographic factors
- **Trend Analysis:** Equity metrics over time
- **Program Comparison:** Which programs best serve underrepresented communities

---

## 11. Operational Efficiency Framework

This dimension evaluates administrative efficiency in program delivery, identifying opportunities to reduce burden and improve service.

### 11.1 Key Metrics

| Metric | Calculation | Alert Threshold |
|--------|-------------|-----------------|
| Agreement Volume by Program | COUNT of agreements per program | > 500 small agreements (consolidation opportunity) |
| Average Value per Transaction | Total value / Agreement count | < $10,000 avg (high overhead risk) |
| Administrative Ratio Proxy | Agreement count / Total value | Deviation from peer programs |
| Multi-Year vs. Annual Ratio | Multi-year agreements / Total | < 20% multi-year (renewal burden) |
| Renewal Rate | Sequential agreements to same recipient | > 80% (consider longer terms) |
| Amendment Processing Volume | Amendments / Original agreements | > 0.5 ratio (design issue) |

### 11.2 Efficiency Opportunity Indicators

- Programs with very high volume of micro-grants (consolidation potential)
- Programs with annual renewals to consistent recipients (multi-year opportunity)
- Recipients receiving multiple small agreements (streamlining opportunity)
- Programs with identical recipient lists year-over-year (formula funding potential)

---

## 12. Data Quality Assessment Framework

This dimension monitors data completeness, consistency, and accuracy to support reliable analysis and identify reporting improvement opportunities.

### 12.1 Completeness Metrics

| Field | Criticality | Target Completion |
|-------|-------------|-------------------|
| recipient_legal_name | Essential - Required for all analysis | 100% |
| agreement_value | Essential - Required for financial analysis | 100% |
| agreement_start_date | Essential - Required for temporal analysis | 100% |
| recipient_province | Essential - Required for geographic filtering | 100% |
| recipient_city | High - Important for local analysis | > 95% |
| recipient_postal_code | High - Enables detailed geographic analysis | > 90% |
| recipient_type | High - Important for recipient analysis | > 85% |
| naics_identifier | Medium - Enables industry analysis | > 70% |
| recipient_business_number | Medium - Enables cross-reference | > 60% |
| federal_riding_number | Low - Supplementary geographic data | > 50% |
| expected_results_en | Medium - Important for outcome analysis | > 75% |

### 12.2 Data Quality Dashboard

- **Completeness Score:** Weighted average of field completion rates
- **Trend Analysis:** Quality metrics over time by department
- **Department Comparison:** Relative data quality across reporting organizations
- **Field-Level Detail:** Specific gaps by program and department

### 12.3 Data Quality Alerts

- Flag records missing essential fields
- Flag programs with > 50% missing optional fields
- Flag departments with declining data quality trends
- Flag inconsistent data (e.g., end date before start date)

---

## 13. Key Performance Indicators Dashboard

The main dashboard should present high-level KPIs with drill-down capability into each analysis dimension.

### 13.1 Executive Summary KPIs

| KPI | Description | Refresh | Target |
|-----|-------------|---------|--------|
| Total Alberta Funding | Sum of all agreement values | Daily | Track trend |
| Active Agreements | Count currently active | Daily | Track trend |
| Unique Recipients | Distinct organization count | Daily | Growing |
| High Risk Agreements | Count with risk score > 75 | Daily | < 5% |
| Data Quality Score | Weighted completeness % | Daily | > 85% |
| Geographic Coverage | % of ridings with funding | Quarterly | > 90% |
| New Recipient Rate | First-time recipients YTD | Monthly | > 20% |
| Amendment Rate | Agreements with amendments | Monthly | < 25% |

### 13.2 Dashboard Layout

The dashboard should be organized into the following sections:

- **Header:** Filter summary bar showing active filters and record count
- **Row 1:** KPI cards (8-10 primary metrics with sparklines)
- **Row 2:** Geographic map + temporal trend chart
- **Row 3:** Top recipients table + program distribution chart
- **Row 4:** Risk distribution + data quality indicators
- **Footer:** Alert notifications and anomaly flags

---

## 14. Alert & Anomaly Detection Rules

The system should implement automated anomaly detection with configurable alert thresholds.

### 14.1 Alert Categories

| Category | Rule Description | Severity | Action |
|----------|------------------|----------|--------|
| Financial | Agreement value > 3 std dev from program mean | High | Flag for review |
| Financial | Value just below threshold ($24,999, $99,999) | Medium | Note pattern |
| Temporal | Q4 spending > 40% of annual total | Medium | Program flag |
| Temporal | Project duration < 30 days with value > $100K | High | Flag for review |
| Geographic | Federal riding with zero funding for 2+ years | Low | Coverage alert |
| Recipient | Single recipient > 25% of program funding | High | Concentration flag |
| Recipient | New recipient with first agreement > $500K | Medium | Capacity check |
| Risk | Composite risk score > 75 | High | Priority review |
| Data Quality | Essential field missing | High | Data correction |
| Data Quality | Program with > 50% records missing NAICS | Low | Reporting flag |

### 14.2 Alert Management

- **Alert Dashboard:** Centralized view of all active alerts by category and severity
- **Subscription:** Users can subscribe to specific alert types
- **Resolution Tracking:** Alerts can be acknowledged, investigated, or dismissed with notes
- **Historical Log:** Audit trail of all alerts and resolutions

---

## 15. Implementation Specifications

### 15.1 Data Refresh Requirements

- **Primary data:** Daily incremental refresh from Open Data API
- **Full refresh:** Weekly complete dataset reload
- **Derived metrics:** Calculated during ETL process
- **Historical snapshots:** Monthly point-in-time archives

### 15.2 User Interface Requirements

- Responsive design supporting desktop and tablet
- Maximum page load time: 3 seconds
- Filter application: Sub-second response
- Export capability: CSV, Excel, PDF for all views
- Saved views: Users can save and share filter configurations

### 15.3 Integration Points

- Canada Open Data API (primary data source)
- Statistics Canada (population data for per-capita calculations)
- Elections Canada (federal riding boundaries)
- Canada Revenue Agency (business number validation - if accessible)

### 15.4 Security & Access Control

- **Role-based access:** Analyst, Reviewer, Administrator
- **Audit logging:** All queries and exports logged
- **Data classification:** Public data, no PII concerns

---

## Appendix A: Data Field Reference

Complete reference of all fields in the Grants and Contributions dataset with usage notes for this framework.

| Field Name | Type | Framework Usage |
|------------|------|-----------------|
| ref_number | text | Unique identifier for records |
| amendment_number | text | Risk scoring, amendment analysis |
| amendment_date | text | Temporal analysis of modifications |
| agreement_type | text | Primary filter (G/C/O classification) |
| recipient_type | text | Recipient analysis, equity assessment |
| recipient_business_number | text | Cross-reference, entity resolution |
| recipient_legal_name | text | Primary recipient identifier |
| recipient_operating_name | text | Alternative name matching |
| recipient_province | text | Primary geographic filter (AB) |
| recipient_city | text | Geographic analysis, urban/rural |
| recipient_postal_code | text | Detailed geographic mapping |
| federal_riding_name_en | text | Political geography analysis |
| prog_name_en | text | Program filter and analysis |
| agreement_title_en | text | Keyword search, project identification |
| agreement_value | text | Financial analysis (convert to numeric) |
| agreement_start_date | text | Temporal analysis, fiscal year derivation |
| agreement_end_date | text | Duration calculation, active status |
| description_en | text | Keyword search, quality assessment |
| expected_results_en | text | Outcome clarity scoring |
| naics_identifier | text | Industry classification analysis |
| owner_org_title | text | Department filter and comparison |

---

## Appendix B: Filter Logic Specifications

Technical specifications for filter implementation and combination logic.

### B.1 Filter Combination Logic

- **Filters within same category:** OR logic (e.g., City = Calgary OR Edmonton)
- **Filters across categories:** AND logic (e.g., City = Calgary AND Value > $100K)
- **Date ranges:** Inclusive of boundary dates
- **Text search:** Case-insensitive, partial match supported

### B.2 Derived Field Calculations

#### Fiscal Year Derivation

Canadian federal fiscal year runs April 1 to March 31. Derivation logic:

- If month >= 4 (April): Fiscal Year = Calendar Year
- If month < 4 (Jan-Mar): Fiscal Year = Calendar Year - 1
- Example: March 15, 2024 = FY 2023-24; April 15, 2024 = FY 2024-25

#### Quarter Derivation

- **Q1:** April - June
- **Q2:** July - September
- **Q3:** October - December
- **Q4:** January - March

#### Urban/Rural Classification

Based on postal code and city name matching:

- **Metro:** Calgary, Edmonton (and associated postal codes T2/T3, T5/T6)
- **Urban:** Red Deer, Lethbridge, Medicine Hat, Grande Prairie, Fort McMurray, Airdrie, St. Albert
- **Rural:** All other Alberta postal codes (T0*, T1*, T4*, T7*, T8*, T9*)

#### Agreement Status

- **Active:** Current date between agreement_start_date and agreement_end_date
- **Completed:** Current date > agreement_end_date
- **Upcoming:** Current date < agreement_start_date

#### Project Duration (Days)

`agreement_end_date - agreement_start_date` (in days)

### B.3 API Query Parameters

The Canada Open Data API supports the following query parameters for server-side filtering:

- **resource_id:** 1d15a62f-5656-49ad-8c88-f40ce689d831
- **filters:** JSON object for exact match filtering
- **q:** Full-text search across all fields
- **limit:** Records per request (default 100, max 32000)
- **offset:** Pagination offset
- **sort:** Field name with asc/desc

**Example API call for Alberta recipients:**

```
https://open.canada.ca/data/api/3/action/datastore_search?resource_id=1d15a62f-5656-49ad-8c88-f40ce689d831&filters={"recipient_province":"AB"}&limit=1000
```

---

*— End of Document —*