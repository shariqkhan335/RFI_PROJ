# Functional Requirements — Assessment Services Branch

> Source: “Assessment Services Branch” Content Inventory workbook (Content Inventory + Column Purposes sheets).

## 1. Purpose
Build a system to capture, manage, and report on the **Content Inventory** for Assessment Services Branch, supporting retention/disposition planning and functional classification alignment (FCT).

## 2. Scope
### In scope
- Create and maintain Content Inventory records for business processes and the content they produce.
- Record retention schedule references, triggers, periods, and final disposition.
- Record security classification and whether content is a Personal Information Bank (PIB).
- Record alignment to Function/Activity (FCT).
- Provide search, filtering, and export for analysis and reporting.

### Out of scope (initial release)
- Automated legal interpretation of retention schedules.
- Automated FOIP processing.
- Full enterprise RBAC integration (can be stubbed).

## 3. Users and Roles
- **Business Contributor**: enters/updates inventory records for their area.
- **Records Analyst**: validates retention/disposition and provides guidance.
- **TSD/IMT Reviewer**: adds technical notes; validates locations/systems.
- **Approver/Manager**: approves finalized records; locks for reporting.
- **Admin**: manages users, reference lists, and system configuration.

## 4. Core Data Model (minimum fields)
Each Content Inventory record shall support the following fields (based on the workbook headers used by the branch):

1. Process Name  
2. Process Description  
3. Content (examples of records/data produced)  
4. Information Controller (authority for managing the content)  
5. Medium (e.g., electronic/paper)  
6. Location (system(s) / physical location)  
7. Security Classification (C only)  
8. Personal Information Bank (PIB) (Yes/No)  
9. Approved Retention Schedule(s) and Item Number(s)  
10. Retention Trigger(s)  
11. Retention Period(s)  
12. Final Disposition(s)  
13. Business Area’s Retention Notes  
14. FCT Alignment – Function  
15. FCT Alignment – Activity  
16. FCT Alignment Notes  

## 5. Functional Requirements

### 5.1 Record creation and editing
**FR-1** The system shall allow authorized users to create a new Content Inventory record.  
**FR-2** The system shall allow authorized users to edit an existing Content Inventory record.  
**FR-3** The system shall require at minimum: Process Name, Process Description, Content, Information Controller, Medium, and Location.  
**FR-4** The system shall validate that Personal Information Bank (PIB) is explicitly set (Yes/No).  
**FR-5** The system shall allow users to save drafts without completing optional fields.

### 5.2 Structured reference lists
**FR-6** The system shall support managed picklists/reference lists for at least: Medium, Security Classification, and PIB.  
**FR-7** The system shall allow Admins to update reference lists without code changes.

### 5.3 Retention and disposition tracking
**FR-8** The system shall allow users to record one or more retention schedule references (schedule + item number).  
**FR-9** The system shall allow users to record retention trigger(s), retention period(s), and final disposition(s).  
**FR-10** The system shall allow free-text retention notes for business-area context.

### 5.4 Security classification and privacy indicators
**FR-11** The system shall allow users to assign Security Classification for each record.  
**FR-12** The system shall allow users to flag records as PIB and capture any related notes (if applicable).  
**FR-13** The system shall provide a filter to list all PIB-flagged records.

### 5.5 FCT alignment
**FR-14** The system shall allow users to set FCT Alignment – Function and FCT Alignment – Activity for each record.  
**FR-15** The system shall allow users to add FCT Alignment Notes.  
**FR-16** The system shall allow reporting/filtering by Function and by Activity.

### 5.6 Notes and collaboration
**FR-17** The system shall support separate notes streams for:
- Business Area notes (business context)
- Technical notes (TSD/IMT context)

**FR-18** The system shall record the author and timestamp for each note entry.

### 5.7 Review and approval workflow (lightweight)
**FR-19** The system shall support status values: Draft → In Review → Approved (minimum).  
**FR-20** The system shall allow Records Analyst and/or Approver roles to approve a record.  
**FR-21** When a record is Approved, the system shall prevent edits except by Admin (or via a controlled “re-open” action).

### 5.8 Search, filters, and reporting views
**FR-22** The system shall provide keyword search across Process Name, Process Description, Content, and Location.  
**FR-23** The system shall provide filters at minimum for: Medium, PIB flag, Security Classification, Final Disposition, and FCT Function/Activity.  
**FR-24** The system shall provide a summary view (counts) by selected filters (e.g., number of PIB records, number by disposition).

### 5.9 Import / Export
**FR-25** The system shall export the Content Inventory dataset to CSV and Excel formats.  
**FR-26** The system shall support importing from the standard workbook format (header-based mapping) with validation and an error report.

### 5.10 Audit and history
**FR-27** The system shall record an audit trail of create/update actions (who, what, when).  
**FR-28** The system shall allow viewing prior versions of a record (at least last N revisions).

## 6. Acceptance Criteria (examples)
- A Business Contributor can create a record with required fields and save it as Draft.
- A Records Analyst can move a record to Approved and it becomes read-only.
- Export produces an Excel file with the 16 core fields as columns.
- A user can filter to “PIB = Yes” and export the resulting subset.

