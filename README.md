# GharSahayak – Smart Digital Life Administration Platform for Indian Families

GharSahayak is a secure, responsive, full-stack digital life administration platform designed specifically for Indian families to organize important documents, track expirations and renewal deadlines, manage administrative workflows, assign household tasks, and maintain a centralized family workspace.

---

## 🌟 Key Features Implemented

### 1. User Roles & Authentication
- **Family Admin**: Full administrative control over family workspaces, member invitations, role management, document deletion/permissions, workflow creation, and health diagnostics.
- **Family Member**: View shared family documents, upload personal records, complete assigned family tasks, view workflow readiness, and set reminder alerts.
- **Authentication**:
  - Secure registration (Full Name, Email, Password, Phone).
  - Post-registration choice: **Create a Family** or **Join an Existing Family** with a 6-character workspace invite code (e.g. `SINGH-786`).
  - Bcrypt password hashing & JWT authentication with Bearer tokens.
  - Forgot password & 6-digit verification code reset flow.
  - Personal profile editor (Avatar color personalization, contact details).

### 2. Main Dashboard (Executive SaaS Aesthetics)
- **Personalized Greeting**: "Good morning, Aditi – Here's what needs your attention today."
- **4 Compact KPI Cards**:
  - Total Documents (28 / 3 expiring soon)
  - Deadlines (06 / renewals & due dates)
  - Tasks (08 / 3 pending)
  - Family Members (04 / active members)
- **Action Required Section**: Prioritized urgent items:
  - *Vehicle Insurance Policy (Hyundai Creta)* – Expires in 8 days `[Review]`
  - *Apply for Tehsildar Income Certificate* – Priority: URGENT `[View Task]`
  - *Scholarship Application* – Readiness: 67% (4/6 ready) `[Continue]`
- **Family Admin Health Score**:
  - Circular progress ring display (e.g. 85 / 100, GOOD).
  - Deterministic transparent scoring model explaining deductions and maintained safeguards with an interactive explanation modal.
- **Interactive Visualizations (Recharts)**:
  - Documents by Indian Category (Identity, Education, Vehicle, Insurance, Financial, Property, Warranty).
  - Upcoming Monthly Expiration Timeline.

### 3. Smart Document Vault
- **Complete Management**: Upload, view metadata, download physical files, edit notes/locker references, and delete.
- **Categorization tailored to Indian Households**: Identity (Aadhaar, PAN, Passport, Voter ID), Education, Vehicle (RC, DL, Insurance), Insurance (Health, Term Life), Financial (ITR, Bank Statements), Property, Warranty, Government.
- **Granular Privacy**: Choose between **Shared with Family** or **Private Only** (hidden from other family members).
- **Dual View Modes**: Switch between Grid Cards view and Sortable Table List view.
- **Security Safeguard**: Sensitive document and policy numbers are never displayed directly on public cards.

### 4. Intelligent Document Auto-Classification
- Built-in heuristic NLP classifier analyzing uploaded file names, titles, and text markers against standard Indian document taxonomies.
- Suggests category, document type, and confidence percentage (e.g. `Vehicle Insurance, Confidence: 95%`) with one-click **Accept Suggestion** or manual edit.

### 5. Document Expiry Tracker & Radar
- Categorized timeline tiers:
  - **Expired** (Red badge)
  - **Next 7 Days** (Critical warning)
  - **Next 30 Days** (Approaching renewal)
  - **Next 90 Days**
  - **Later / Long-term**
- Custom reminder alert configuration (90, 30, 15, 7, or 1 day before expiration).

### 6. Administrative Workflow & Checklist System (Signature Feature)
- Pre-built templates for common Indian administrative processes:
  - **Scholarship Application** (Photograph, Academic marksheet, Admission proof, Bank document, Income certificate, Declaration)
  - **College Admission Counseling** (Class 10th/12th marksheets, Transfer certificate, Migration, Identity)
  - **Vehicle Insurance Renewal** (Previous policy, RC, PUC certificate)
  - **Passport Renewal** (Old passport, Aadhaar, Address proof, Photos)
  - **School Admission** (Birth certificate, Immunization record, Parent IDs)
  - **Appliance Warranty Claim** (Invoice, Stamped warranty card)
  - **Custom Workflows**
- **Dynamic Readiness Score Calculation**: Real-time percentage indicator (e.g. `4/6 = 67% Ready`) with dual breakdown of **Available Documents** vs **Missing Documents**.
- **Vault Document Linking**: Seamlessly connect existing verified documents from your vault to fulfill checklist items.

### 7. Family Task Management
- Assign tasks to specific family members with due dates and priorities (`Urgent`, `High`, `Medium`, `Low`).
- Tabs: `All Tasks`, `My Tasks`, `Assigned by Me`, `Completed`.
- Quick one-click checkbox status toggle and overdue indicators.

### 8. Unified Deadline Calendar
- Aggregates document expiration dates, task deadlines, and workflow application dates.
- Switch between **Month View** and **Upcoming Chronological List**.
- Side drawer inspection on event click with direct action shortcuts.

### 9. Notification Center & Global Search
- Slide-out notification drawer with unread count badges and "Mark all as read".
- Global search bar (`⌘K` or `/`) with instant grouped results across Documents, Tasks, Workflows, and Family Members.

### 10. Audit Activity History
- Complete chronological audit log of all family operations (User, Action, Date, Time, Entity details).

---

## 🚀 Instant Demo Credentials

The database is pre-seeded with the **Singh Family** workspace:

| Role | Name | Email | Password |
|---|---|---|---|
| **Family Admin** | Aditi Singh | `aditi@singhfamily.in` | `password123` |
| **Member (Father)** | Rajesh Singh | `father@singhfamily.in` | `password123` |
| **Member (Mother)** | Sunita Singh | `mother@singhfamily.in` | `password123` |
| **Member (Brother)**| Aman Singh | `brother@singhfamily.in` | `password123` |

*Workspace Invite Code*: `SINGH-786`

---

## 🛠 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router v6.
- **Backend**: Node.js, Express.js, REST API architecture.
- **Database**: SQLite3 (`better-sqlite3`) with full relational schema, foreign keys, constraints, and indexes.
- **Security & Storage**: JWT Bearer authentication, bcryptjs, Multer file upload with type and size limits.

---

## 🏃‍♂️ Running Locally

### Backend Server:
```bash
cd backend
npm install
node server.js
```
Runs at `http://localhost:5001`.

### Frontend Server:
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`.
