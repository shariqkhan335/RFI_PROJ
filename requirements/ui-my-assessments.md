# My Assessments – UI Functional Design

**Derived from:** Functional Requirements – Assessment Services Branch  
**Primary Role:** Business Contributor  
**Feature Area:** Content Inventory Management  
**Source:** Assessment Services Branch Content Inventory Workbook  

---

## Purpose

This document defines the functional user interface design for the **My Assessments** page.  
It describes layout, controls, user actions, and behaviors required to support Business Contributors in creating, managing, and tracking Content Inventory records.

---

## 1. Page Layout & Structure

The page uses a standard enterprise application layout:

- **Header**
  - Application title
  - User profile and logout
  - Optional global search

- **Navigation**
  - Links to:
    - My Assessments
    - All Assessments (role-based)
    - Reports
    - Administration (role-based)

- **Main Content Area**
  - Dedicated to the “My Assessments” feature

- **Footer**
  - Copyright
  - Application version

**Related Requirements:** FR-1

---

## 2. Main Content Area – My Assessments

### 2.1 Actions & Overview

#### Create New Assessment
- **Control:** Primary action button
- **Label:** “Create New Assessment” / “Add Content Inventory Record”
- **Placement:** Prominently displayed at top of page
- **Behavior:** Opens a new assessment form

**Related Requirements:** FR-1

#### Summary Cards (Optional)
- My Drafts
- In Review
- Approved
- Total Assessments

**Related Requirements:** FR-24

---

### 2.2 Search and Filters

#### Keyword Search
- **Label:** “Search my assessments…”
- **Scope:** Process Name, Process Description, Content, Location
- **Behavior:** Filters results dynamically or on submit

#### Filters
- Status (Draft, In Review, Approved)
- Medium
- PIB Flag (Yes / No / All)
- Security Classification
- Final Disposition
- FCT Function
- FCT Activity

#### Controls
- Apply Filters
- Clear Filters

**Related Requirements:** FR-22, FR-23

---

### 2.3 Assessment List / Table

The assessment list is presented in a tabular format.

#### Core Columns
1. Process Name (clickable)
2. Content (preview)
3. Information Controller
4. Medium
5. Location
6. Security Classification
7. PIB Indicator
8. FCT Function
9. FCT Activity
10. Status
11. Last Updated
12. Actions

**Related Requirements:** FR-3, FR-11, FR-12, FR-14, FR-19, FR-27

#### Table Features
- Sortable columns
- Pagination
- Row hover highlighting
- Status indicators (visual)

---

### 2.4 Row Actions

#### Edit
- Enabled for Draft and In Review records
- Disabled for Approved records unless role allows override

#### View
- Always enabled
- Opens record in read-only mode when applicable

#### Submit for Review
- Visible only for Draft records
- Enabled only when mandatory fields are complete

#### Delete (Optional)
- Draft records only
- Requires confirmation

**Related Requirements:** FR-2, FR-5, FR-19, FR-21

---

### 2.5 Export Options

- **Control:** Export dropdown or button
- **Formats:** CSV, Excel
- **Scope:** Current filtered dataset

**Related Requirements:** FR-25

---

### 2.6 Import Option

- **Control:** Import Records button
- **Behavior:**
  - Upload workbook
  - Validate data
  - Display success and error summary
- **Support:** Template download

**Related Requirements:** FR-26

---

## 3. User Experience Considerations

- Responsive layout
- Clear success and error messaging
- Accessibility (keyboard navigation, screen reader compatibility)
- Consistent navigation and labeling
- Loading indicators for long-running actions

---

## 4. Interaction Flow (Business Contributor)

1. User logs in and navigates to My Assessments.
2. User views existing assessments.
3. User selects “Create New Assessment”.
4. User completes required fields and saves as Draft.
5. User edits draft records as needed.
6. User submits completed record for review.
7. User filters assessments by PIB flag.
8. User exports filtered results to Excel.

---

## Summary

This UI design supports the full lifecycle of Content Inventory management for Business Contributors, providing structured data entry, search, filtering, workflow status, and export/import capabilities aligned with the defined functional requirements.
