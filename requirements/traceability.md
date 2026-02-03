\# Requirements Traceability Matrix



| Req ID | Requirement (short) | UI Page | API Endpoint | Data / File | Status | Notes |

|-------|----------------------|--------|--------------|-------------|--------|------|

| FR-1  | Home page loads       | /index.html | GET / | public/index.html | ✅ Done | Shows “RFI\_PROJ running” |

| FR-2  | Health check endpoint | (n/a) | GET /health | server.js | ✅ Done | Used for monitoring |

| FR-3  | View RFIs list         | /my-rfis.html | GET /api/rfis | public/data/rfis.json | ⚠️ Partial | Need filters/sorting |

| FR-4  | View Assessments list  | /my-assessments.html | GET /api/assessments | public/data/assessments.json | ⚠️ Partial | Need details panel |

| FR-5  | Create/Update record   | (form page) | POST /api/assessments | (future DB) | ❌ Missing | Add form + save |

| FR-6  | Export / Download      | /my-assessments.html | GET /api/export | (future) | ❌ Missing | CSV/Excel export |



