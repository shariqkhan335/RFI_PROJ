\# RFI\_PROJ Requirements Traceability Matrix



This document traces the implementation of functional requirements (FR) for the RFI\_PROJ prototype.



| FR Item                                       | UI Page(s)            | API Endpoint(s)          | File(s)                                                  | Status    | Notes                                                                                               |

| :-------------------------------------------- | :-------------------- | :----------------------- | :------------------------------------------------------- | :-------- | :-------------------------------------------------------------------------------------------------- |

| Home page shows app name and nav links        | `/index.html`         | N/A                      | `public/index.html`, `public/assets/css/styles.css`      | Done      | Basic navigation to other pages.                                                                    |

| Login page supports "Demo mode"               | `/login.html`         | N/A                      | `public/login.html`, `public/assets/js/app.js`           | Done      | Stores fake user in localStorage, redirects to My Assessments.                                      |

| \*\*My Assessments Page:\*\*                      | `/my-assessments.html`|                          |                                                          |           |                                                                                                     |

| - Title "My Assessments"                      | `/my-assessments.html`| N/A                      | `public/my-assessments.html`, `public/assets/css/styles.css` | Done      | H1 tag on the page.                                                                                 |

| - "Create New Assessment" button (modal form) | `/my-assessments.html`| `POST /api/assessments`  | `public/my-assessments.html`                             | Done      | Button opens a modal for creating/editing.                                                          |

| - Keyword search (processName, content, location) | `/my-assessments.html`| N/A (client-side filter) | `public/my-assessments.html`                             | Done      | Client-side filtering on fetched data.                                                              |

| - Filters: Status, PIB, Security Classification | `/my-assessments.html`| N/A (client-side filter) | `public/my-assessments.html`                             | Done      | Dropdown filters for specified fields, client-side.                                                 |

| - Table columns per UI design                 | `/my-assessments.html`| N/A                      | `public/my-assessments.html`, `public/assets/css/styles.css` | Done      | All specified columns are present.                                                                  |

| - Row actions: View, Edit, Submit for Review  | `/my-assessments.html`| `PUT /api/assessments/:id` | `public/my-assessments.html`                             | Done      | View is a simple alert, Edit opens modal, Submit changes status to "In Review".                     |

| - Edit disabled when Approved                 | `/my-assessments.html`| N/A                      | `public/my-assessments.html`                             | Done      | Edit button is disabled via JavaScript.                                                             |

| - Submit enabled only for Draft               | `/my-assessments.html`| N/A                      | `public/my-assessments.html`                             | Done      | Submit button is disabled via JavaScript for non-Draft statuses.                                    |

| - Export CSV for filtered list                | `/my-assessments.html`| N/A (client-side)        | `public/my-assessments.html`                             | Done      | Generates CSV from currently displayed (filtered) table data.                                       |

| - Import assessments from JSON file upload    | `/my-assessments.html`| `POST /api/assessments`  | `public/my-assessments.html`                             | Done      | Reads JSON, performs basic validation, and adds new assessments via API (simulated individual POSTs). |

| \*\*My RFIs Page:\*\*                             | `/my-rfis.html`       |                          |                                                          |           |                                                                                                     |

| - Simple table listing RFIs                   | `/my-rfis.html`       | `GET /api/rfis`          | `public/my-rfis.html`, `public/data/rfis.json`           | Done      | Displays data from `rfis.json`.                                                                     |

| - Status filter for RFIs                      | `/my-rfis.html`       | N/A (client-side filter) | `public/my-rfis.html`                                    | Done      | Client-side filtering for RFI status.                                                               |

| - “View” action for RFIs                      | `/my-rfis.html`       | N/A                      | `public/my-rfis.html`                                    | Done      | Simple alert for viewing RFI details.                                                               |

| \*\*API Endpoints:\*\*                            |                       |                          |                                                          |           |                                                                                                     |

| - GET `/health`                               | N/A                   | `/health`                | `server.js`                                              | Done      | Returns "OK".                                                                                       |

| - GET `/api/assessments`                      | N/A                   | `/api/assessments`       | `server.js`, `public/data/assessments.json`              | Done      | Returns JSON array from `assessments.json`.                                                         |

| - POST `/api/assessments`                     | N/A                   | `/api/assessments`       | `server.js`, `public/data/assessments.json`              | Done      | Adds new assessment to `assessments.json`.                                                          |

| - PUT `/api/assessments/:id`                  | N/A                   | `/api/assessments/:id`   | `server.js`, `public/data/assessments.json`              | Done      | Updates existing assessment in `assessments.json`.                                                  |

| - GET `/api/rfis`                             | N/A                   | `/api/rfis`              | `server.js`, `public/data/rfis.json`                     | Done      | Returns JSON array from `rfis.json`.                                                                |

