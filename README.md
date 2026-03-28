
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

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (3.12+)
* [Docker](https://www.docker.com/) & Docker Compose (for spinning up PostGIS and services easily)

### 1. Clone the Repository
```bash
git clone [https://github.com/your-org/omnigrievance.git](https://github.com/your-org/omnigrievance.git)
cd omnigrievance
