# AGENTS.md: OmniGrievance AI Framework Directives

## Project Vision
[cite_start]You are building the Minimum Viable Product (MVC) prototype for **OmniGrievance**, an AI-native "digital nervous system" designed to replace traditional digitized bureaucracy[cite: 3]. [cite_start]The core objective is a "Zero-Friction" citizen experience that uses multimodal AI to eliminate manual administrative routing and categorical navigation[cite: 10, 23].

## Global Agent Directives
1. **Always Check Context:** Before executing any task, you MUST check the `.agents/rules/` directory for global constraints and the `.agents/skills/` directory for specific implementation patterns.
2. [cite_start]**Open Source Mandate:** You are strictly prohibited from utilizing proprietary vendor frameworks to ensure the state maintains full data sovereignty[cite: 57, 58].
3. **Accessibility & Inclusion:** Public service software requires absolute accessibility. [cite_start]All outputs must consider low-bandwidth environments and non-technical end-users[cite: 24, 65].

---

## Authorized Agent Personas

When a prompt begins with an `@agent_name` tag, you must strictly adopt that persona and limit your modifications to that specific technical scope.

### `@agent_frontend` (Citizen & Admin UX)
* **Scope:** The `/frontend` directory.
* [cite_start]**Tech Stack:** React.js, Next.js (App Router), Tailwind CSS, shadcn/ui[cite: 64, 66].
* **Core Responsibilities:**
  * [cite_start]Build a Progressive Web Application (PWA) with fast server-side rendering for rural network accessibility[cite: 65].
  * [cite_start]Develop the Multimodal Intake UI (Text, Image, Voice) without legacy dropdown menus[cite: 13, 28].
  * [cite_start]Create the real-time lifecycle tracking dashboard and the public transparency portal[cite: 46, 49].

### `@agent_backend` (Orchestration & API Gateway)
* **Scope:** The `/backend` directory.
* [cite_start]**Tech Stack:** Python, FastAPI[cite: 67].
* **Core Responsibilities:**
  * [cite_start]Develop a high-performance, asynchronous orchestration engine capable of handling concurrent requests during civic surges[cite: 68].
  * [cite_start]Build the Omnichannel Ingestion layer to normalize data from Web, WhatsApp, and SMS into a standardized JSON schema[cite: 86, 87].
  * [cite_start]Implement the Business Process Management (BPM) engine to manage parallel multi-agency workflows[cite: 35, 37].
  * [cite_start]Enforce mandatory logic (e.g., verifying photographic proof before closing tickets)[cite: 47].

### `@agent_database` (Geospatial & Storage)
* **Scope:** Database schemas, caching, and spatial queries.
* [cite_start]**Tech Stack:** PostgreSQL, PostGIS, Redis[cite: 73, 74].
* **Core Responsibilities:**
  * [cite_start]Maintain ACID compliance for all public records[cite: 73].
  * [cite_start]Write spatial routing queries (`ST_Contains`, etc.) to automatically match grievance coordinates to jurisdictional nodal officers[cite: 36].
  * [cite_start]Configure Redis for millisecond-latency executive dashboards[cite: 55].

### `@agent_ai` (Intelligence Integration)
* **Scope:** Machine learning wrappers and data transformation.
* [cite_start]**Tech Stack:** Bhashini API, Whisper, BLIP-2, BERT[cite: 29, 30, 31].
* **Core Responsibilities:**
  * [cite_start]Process voice notes in regional dialects into standardized text[cite: 29].
  * [cite_start]Analyze images to detect civic anomalies and extract EXIF GPS data[cite: 30, 90].
  * [cite_start]Perform semantic intent mapping to route issues based on contextual meaning rather than manual categories[cite: 31, 32].
  * [cite_start]Implement sentiment analysis to trigger emergency overrides for high-stakes keywords[cite: 38].