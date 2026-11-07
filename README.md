# RoutePulse

> **Fast, trackable approvals from submission to signature.**

RoutePulse is a centralized university document submission, verification, and multi-stage approval management platform. It streamlines academic and administrative paperwork—eliminating long queues, physical visits, and missing records.

Initial institutional profile: **REVA University, Bengaluru, Karnataka, India**.

---

## Key Features

- **Dynamic Branch & Authority Cascade**: Select department and branch to dynamically resolve registered Class Coordinators, Faculty, HODs, and Directors.
- **Priority & Deadline Control**: Urgent (Red), This Week (Yellow), and This Month (Green) priority flags with targeted datetime deadlines.
- **Secure File Storage**: Direct file attachments with private bucket isolation, digital receipts, and versioning.
- **Faculty Review Queue**: Assigned reviewer dashboard with priority-first sorting, preview modal, instant student contact access (Call/WhatsApp), and one-click actions:
  - *In Progress*
  - *Approve*
  - *Mark Invalid / Reject (mandatory justification)*
  - *Request Physical Signature*
- **Real-Time Status & Messaging**: Live progress timeline steppers with submission-scoped direct messaging threads between students and reviewing faculty.
- **Auditing & Verification**: Tamper-evident receipt manifest generation with digital security hashes.

---

## Tech Stack

- **Frontend**: React 19, Vite, React Router DOM, Lucide Icons, Modern CSS
- **Backend**: Supabase Auth, PostgreSQL, Row-Level Security (RLS), Supabase Storage & Realtime
- **Design Aesthetic**: Linear / Stripe-inspired clean typography, soft shadows, responsive cards, and high contrast accents

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*(If no `.env` is configured, RoutePulse automatically operates in high-fidelity interactive offline demo mode).*

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
