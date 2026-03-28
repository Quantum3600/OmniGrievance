
# 🏛️ OmniGrievance | Smart Public Service CRM (PS-CRM)

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

> **Developing a centralized digital command center that organizes citizen complaints, automates workflows, assigns tasks, tracks progress in real-time, and ensures transparent and efficient grievance resolution.**

## 📖 Overview

**OmniGrievance** is a next-generation Smart Public Service CRM (PS-CRM) designed to bridge the gap between citizens and government agencies. By acting as a centralized digital command center, it eliminates bureaucratic bottlenecks, automates the routing of issues to the correct departments, and provides 100% transparency to the public regarding grievance resolution.

Whether a complaint is filed via our Next.js web portal or sent directly through WhatsApp, OmniGrievance's AI-driven backend instantly categorizes, prioritizes, and assigns it to the optimal field worker based on geospatial data and workload.

---

## ✨ Key Features

### 👤 For Citizens
* **Omnichannel Intake**: Lodge complaints via the modern web portal or simply send a message/image via WhatsApp.
* **Real-Time Tracking**: Track the exact status of your grievance through an intuitive timeline.
* **Multilingual Support**: AI-powered automatic translation ensures language is never a barrier.
* **Transparent Evidence**: View "Before & After" proof of work uploaded by officials.

### 👷‍♂️ For Government Employees & Field Workers
* **Smart Task Dashboards**: Clean, prioritized lists of assigned tasks.
* **Geospatial Routing**: PostGIS-powered routing helps workers find the most efficient path to resolve physical infrastructure issues.
* **One-Click Updates**: Easily upload completion photos and update statuses straight from a mobile device (PWA ready).
* **Performance Leaderboard**: Gamified leaderboards to encourage and reward efficient grievance resolution.

### 🏢 For Administrators & Command Center
* **Centralized Command Dashboard**: High-level overview of city/state-wide grievance metrics.
* **Geospatial Heatmaps**: Visualize problem hotspots (e.g., frequent water leaks or potholes) to aid predictive maintenance.
* **Automated AI Triage**: Gemini/Claude-powered AI automatically analyzes sentiment, categorizes the issue, and flags emergencies for immediate override.
* **Strict RBAC**: Role-Based Access Control ensuring secure handling of sensitive data.

---

## 📂 Project Structure

```bash
OmniGrievance/
├── frontend/                        # Next.js 15 App Router (Citizen + Employee PWA)
│   ├── app/                         # Routes, layouts, pages, loading/error boundaries
│   │   ├── (public)/                # Public-facing pages (landing, auth, help)
│   │   ├── citizen/                 # Citizen dashboard & grievance tracking
│   │   ├── worker/                  # Field worker task dashboard
│   │   ├── admin/                   # Command center & analytics
│   │   └── api/                     # BFF/API routes (if required)
│   ├── components/                  # Reusable UI components (shadcn/ui + custom)
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── maps/
│   │   └── timeline/
│   ├── lib/                         # Utilities, API clients, helpers
│   ├── hooks/                       # React hooks
│   ├── styles/                      # Global styles, Tailwind setup
│   ├── public/                      # Static assets
│   ├── pwa/                         # Service worker + offline cache config
│   └── package.json
│
├── backend/                         # FastAPI orchestration + business logic
│   ├── app/
│   │   ├── main.py                  # FastAPI app entrypoint
│   │   ├── api/                     # Versioned API routers
│   │   │   ├── v1/
│   │   │   │   ├── grievances.py
│   │   │   │   ├── users.py
│   │   │   │   ├── tasks.py
│   │   │   │   ├── analytics.py
│   │   │   │   └── webhooks.py      # WhatsApp/webhook ingestion
│   │   ├── core/                    # Config, security, RBAC, logging
│   │   ├── models/                  # SQLAlchemy models
│   │   ├── schemas/                 # Pydantic schemas (request/response)
│   │   ├── services/                # Core domain services
│   │   │   ├── triage_service.py
│   │   │   ├── routing_service.py
│   │   │   ├── assignment_service.py
│   │   │   └── notification_service.py
│   │   ├── ai_gateway/              # LLM/vision/speech adapters
│   │   ├── db/                      # Session, migrations glue, seed scripts
│   │   └── workers/                 # Background jobs (retries, SLA monitors)
│   ├── tests/                       # Unit & integration tests
│   ├── alembic/                     # DB migrations
│   └── requirements.txt
│
├── infra/                           # Infrastructure & deployment configs
│   ├── docker/
│   │   ├── docker-compose.yml       # App + PostGIS + Redis local stack
│   │   └── Dockerfile.*
│   ├── nginx/                       # Reverse proxy config (optional)
│   └── scripts/                     # Bootstrap/deploy scripts
│
├── docs/                            # Architecture, API docs, ADRs
├── .env.example                     # Environment variable template
├── AGENTS.md                        # Agent responsibilities and constraints
└── README.md
```

> **Note:** Directory names can be adapted, but this structure is recommended for clean separation of concerns and easier team scaling.

---

## 🔄 End-to-End Grievance Flow

OmniGrievance is designed as an AI-assisted workflow engine, not just a ticket logger.  
Below is the standard lifecycle of a grievance:

### 1) Intake (Multi-Channel)
Citizen submits a complaint through:
- Web Portal (text/image/location)
- WhatsApp message/media via webhook
- (Future) Voice/SMS channels

**Output:** Complaint normalized into a common JSON schema.

---

### 2) AI Pre-Processing & Enrichment
Backend AI gateway performs:
- Language normalization / translation
- Intent extraction (what issue is being reported)
- Sentiment scoring (urgency/emergency signals)
- Optional image analysis (e.g., pothole, garbage, streetlight)
- Metadata enrichment (timestamp, geo-coordinates, source channel)

**Output:** Enriched grievance payload with confidence and priority hints.

---

### 3) Smart Classification & Prioritization
Rule engine + AI triage assigns:
- Department/category
- Severity (low/medium/high/critical)
- SLA policy
- Escalation flags for emergency cases

**Output:** Actionable, ranked grievance ready for assignment.

---

### 4) Geospatial Routing & Assignment
Using PostGIS and jurisdiction maps:
- Locate relevant ward/zone/department
- Match grievance to nodal officer / nearest field worker
- Create worker task with due time

**Output:** Task assigned to correct team with route context.

---

### 5) Work Execution (Field Workflow)
Field worker receives task in dashboard/PWA:
- Accepts task
- Navigates to location
- Uploads progress and completion proof (before/after media)
- Marks status updates in real time

**Output:** Verified status transitions with evidence audit trail.

---

### 6) Validation & Closure Controls
System validates mandatory closure requirements:
- Required proof attached?
- Resolution notes present?
- Supervisor approval needed (for critical cases)?

If checks fail, task reopens automatically.

**Output:** Only policy-compliant grievances can be closed.

---

### 7) Citizen Notification & Transparency
Citizen receives updates at each stage:
- Registered
- Assigned
- In Progress
- Resolved / Reopened

Admin portal reflects anonymized transparency metrics and resolution timelines.

**Output:** High trust through visible and auditable progress.

---

### 8) Analytics, Heatmaps & Governance
Command center aggregates system data for:
- Ward-level issue density heatmaps
- Department SLA adherence
- Worker performance trends
- Repeat-incident prediction support

**Output:** Data-driven governance and proactive maintenance planning.

---

## 🧠 Lifecycle State Model (Suggested)

```text
RECEIVED
  → TRIAGED
  → ASSIGNED
  → IN_PROGRESS
  → RESOLVED_PENDING_VERIFICATION
  → CLOSED

Fallback transitions:
- IN_PROGRESS → REOPENED
- RESOLVED_PENDING_VERIFICATION → REOPENED
- Any state → ESCALATED (if SLA breach / emergency)
```

---

## 🔐 Governance & Non-Functional Principles

- **Accessibility First:** Low-bandwidth friendly UI, multilingual interactions, mobile-first PWA.
- **Open Architecture:** Avoid hard dependency on closed/proprietary infrastructure.
- **Auditability:** Every state transition is timestamped and attributable.
- **Security:** Strict RBAC, least-privilege access, protected citizen data.
- **Reliability:** Async processing, retries, and queue-backed workflows for peak civic load.

---
## 🛠️ Tech Stack

### Frontend (User & Employee Portals)
* **Framework**: Next.js 15 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS & Shadcn/UI
* **Features**: Progressive Web App (PWA) configured for offline capabilities

### Backend (Command Center API)
* **Framework**: FastAPI (Python 3.12+)
* **Database**: PostgreSQL with **PostGIS** for spatial and geographic objects
* **ORM**: SQLAlchemy
* **AI Integration**: Custom AI Gateway (supporting multimodal LLMs for image analysis and text processing)
* **Integrations**: WhatsApp Webhook ingestion

---

2. Backend Setup
Bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
3. Frontend Setup
Bash
cd ../frontend
npm install

# Start the Next.js development server
npm run dev
4. Docker Compose (Alternative All-in-One Setup)
Bash
docker-compose up --build
Frontend will be available at http://localhost:3000 and Backend API docs at http://localhost:8000/docs.

🔐 Environment Variables
You will need to set up .env files in both the frontend/ and backend/ directories.

Backend (backend/.env):

Code snippet
DATABASE_URL=postgresql://user:password@localhost:5432/omnigrievance
AI_API_KEY=your_gemini_or_openai_key
WHATSAPP_TOKEN=your_whatsapp_webhook_token
JWT_SECRET=your_secure_jwt_secret
Frontend (frontend/.env.local):

Code snippet
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
🏗️ System Architecture
Ingestion Layer: Receives data via REST API (Web Forms) or Webhooks (WhatsApp).

AI Gateway: Processes incoming text/images to extract Category, Urgency, Location, and Sentiment.

Core Engine (FastAPI): Handles business logic, Role-Based Access Control (RBAC), and PostGIS spatial queries.

Data Layer: PostgreSQL stores normalized records; PostGIS handles geospatial indexing.

Presentation Layer (Next.js): Delivers role-specific dashboards (Admin, Citizen, Employee) via Server-Side Rendering (SSR) and Client-Side React components.

🤝 Contributing
We welcome contributions to make OmniGrievance better for citizens everywhere!

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

Please ensure you read .agents/rules/open-source-only.md to adhere to our open-source tools and libraries mandate.

🛡️ License
Distributed under the MIT License. See LICENSE for more information.

Built with ❤️ for Smarter, Transparent Governance.
git clone [https://github.com/your-org/omnigrievance.git](https://github.com/your-org/omnigrievance.git)
cd omnigrievance
