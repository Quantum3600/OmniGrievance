# 🏛️ OmniGrievance | Smart Public Service CRM (PS-CRM)

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

> **OmniGrievance** is an AI-native digital command center for public service grievance redressal.  
> It helps government teams intake complaints, automate triage and assignment, track resolution in real time, and improve transparency for citizens.

---

## 📖 Overview

**OmniGrievance** is a next-generation Smart Public Service CRM (PS-CRM) that bridges the gap between citizens and government agencies.

Whether a complaint is submitted through the web portal or sent via WhatsApp, the platform normalizes and enriches incoming data, then routes it to the right department or field worker using AI + rule-based orchestration.

The goal is to deliver a **zero-friction citizen experience** while enabling **data-driven governance** for administrators.

---

## ✨ Key Features

### 👤 For Citizens
- **Omnichannel Intake**: Submit complaints through web forms or WhatsApp (text/image).
- **Real-Time Tracking**: Follow grievance lifecycle through a status timeline.
- **Multilingual Support**: AI-assisted translation reduces language barriers.
- **Transparent Evidence**: View before/after proof uploaded by field staff.

### 👷 For Government Employees & Field Workers
- **Smart Task Dashboards**: Prioritized, action-ready work queues.
- **Geospatial Routing**: PostGIS-assisted location and routing context.
- **Mobile-First Updates**: Upload completion evidence directly from PWA/mobile.
- **Performance Insights**: Track resolution efficiency and workload trends.

### 🏢 For Administrators
- **Centralized Command Dashboard**: City/zone-level operational visibility.
- **Geospatial Heatmaps**: Identify repeat hotspots and service gaps.
- **Automated AI Triage**: Sentiment + urgency signals for smarter escalation.
- **Strict RBAC**: Role-based controls for secure and compliant operations.

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
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── grievances.py
│   │   │       ├── users.py
│   │   │       ├── tasks.py
│   │   │       ├── analytics.py
│   │   │       └── webhooks.py      # WhatsApp/webhook ingestion
│   │   ├── core/                    # Config, security, RBAC, logging
│   │   ├── models/                  # SQLAlchemy models
│   │   ├── schemas/                 # Pydantic schemas (request/response)
│   │   ├── services/                # Core domain services
│   │   │   ├── triage_service.py
│   │   │   ├── routing_service.py
│   │   │   ├── assignment_service.py
│   │   │   └── notification_service.py
│   │   ├── ai_gateway/              # LLM/vision/speech adapters
│   │   ├── db/                      # Session, migrations, seed scripts
│   │   └── workers/                 # Background jobs (retries, SLA monitors)
│   ├── tests/                       # Unit & integration tests
│   ├── alembic/                     # DB migrations
│   └── requirements.txt
│
├── infra/                           # Infrastructure and deployment configs
│   ├── docker/
│   │   ��── docker-compose.yml       # App + PostGIS + Redis local stack
│   │   └── Dockerfile.*
│   ├── nginx/                       # Reverse proxy config (optional)
│   └── scripts/                     # Bootstrap/deploy scripts
│
├── docs/                            # Architecture, API docs, ADRs
├── .env.example                     # Environment variable templates
├── AGENTS.md                        # Agent responsibilities and constraints
└── README.md
```

> **Note:** Directory names can evolve, but this structure is recommended for clear separation of concerns and team scalability.

---

## 🔄 End-to-End Grievance Flow

OmniGrievance is an AI-assisted workflow engine, not just a ticket logger.

### 1) Intake (Multi-Channel)
Citizen submits a complaint via:
- Web portal (text/image/location)
- WhatsApp message/media (webhook)
- *(Future)* Voice/SMS channels

**Output:** Complaint normalized into a standard JSON schema.

### 2) AI Pre-Processing & Enrichment
AI gateway performs:
- Language normalization / translation
- Intent extraction
- Sentiment scoring for urgency/emergency
- Optional image analysis
- Metadata enrichment (time, geo, source channel)

**Output:** Enriched grievance payload with confidence + priority hints.

### 3) Smart Classification & Prioritization
Rule engine + AI triage determine:
- Department/category
- Severity (low/medium/high/critical)
- SLA policy
- Escalation flags

**Output:** Ranked grievance ready for assignment.

### 4) Geospatial Routing & Assignment
Using PostGIS + jurisdiction maps:
- Locate ward/zone/department
- Match to nodal officer or nearest worker
- Create task with due-time context

**Output:** Task assigned to the right team.

### 5) Work Execution (Field Workflow)
Field worker:
- Accepts task
- Navigates to location
- Uploads progress and before/after proof
- Updates status in real time

**Output:** Verified status transitions with audit trail.

### 6) Validation & Closure Controls
System enforces closure policy:
- Mandatory proof attached?
- Resolution notes present?
- Supervisor approval needed?

If checks fail, grievance is reopened automatically.

**Output:** Only policy-compliant closures are accepted.

### 7) Citizen Notification & Transparency
Citizen receives updates:
- Registered
- Assigned
- In Progress
- Resolved / Reopened

Admin portal displays anonymized transparency metrics.

**Output:** Trust through visible, auditable progress.

### 8) Analytics, Heatmaps & Governance
Command center aggregates data for:
- Ward-level density heatmaps
- SLA adherence
- Worker performance trends
- Repeat-incident prediction

**Output:** Data-driven governance and proactive planning.

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

- **Accessibility First**: Low-bandwidth friendly, multilingual, mobile-first UX.
- **Open Architecture**: Avoid hard dependency on closed/proprietary infrastructure.
- **Auditability**: Every state transition is timestamped and attributable.
- **Security**: Strict RBAC and least-privilege data access.
- **Reliability**: Async processing, retries, and queue-backed workflows.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Capabilities**: Progressive Web App (PWA), offline-first readiness

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: PostgreSQL + PostGIS
- **ORM**: SQLAlchemy
- **AI Integration**: Multimodal AI gateway (text/image/speech adapters)
- **Integrations**: WhatsApp webhook ingestion

### Infrastructure
- **Containerization**: Docker / Docker Compose
- **Optional Components**: Nginx reverse proxy, Redis cache/queues

---

## 🚀 Getting Started

### 1) Clone Repository
```bash
git clone https://github.com/your-org/omnigrievance.git
cd omnigrievance
```

### 2) Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

### 3) Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4) Docker Compose (All-in-One)
```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

---

## 🔐 Environment Variables

Create environment files in both `backend/` and `frontend/`.

### backend/.env
```env
DATABASE_URL=postgresql://user:password@localhost:5432/omnigrievance
AI_API_KEY=your_ai_provider_key
WHATSAPP_TOKEN=your_whatsapp_webhook_token
JWT_SECRET=your_secure_jwt_secret
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🏗️ System Architecture (High-Level)

1. **Ingestion Layer**: Receives grievances from REST APIs and webhooks.  
2. **AI Gateway**: Extracts intent, urgency, sentiment, and optional visual signals.  
3. **Core Engine (FastAPI)**: Runs RBAC, orchestration logic, and routing rules.  
4. **Data Layer**: PostgreSQL for records + PostGIS for spatial operations.  
5. **Presentation Layer (Next.js)**: SSR + role-specific dashboards.

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository  
2. Create a feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

Please read `.agents/rules/open-source-only.md` before contributing.

---

## 🛡️ License

Distributed under the **MIT License**.  
See `LICENSE` for more information.

---

Built with ❤️ for smarter, transparent governance.
