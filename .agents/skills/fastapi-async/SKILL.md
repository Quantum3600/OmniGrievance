---
name: fastapi-async-backend
description: Guidelines for building the high-performance orchestration API Gateway.
trigger: "When working in the /backend directory, creating API routes, or writing core Python logic."
---

# Skill: FastAPI Asynchronous Gateway

## 1. Core Architecture
* **Framework:** Build the core orchestration engine entirely in Python using FastAPI.
* **Concurrency:** You MUST utilize FastAPI's native asynchronous support (`async def`) for all database queries, AI model calls, and external API requests. The system must handle thousands of concurrent requests without blocking.

## 2. Omnichannel Ingestion
* **Standardization:** All incoming requests from various channels must be normalized into a standard JSON payload containing: `timestamp`, `geo_coordinates`, `media_hash`, and `source_channel`.

## 3. Multi-Agency Workflow Engine
* Implement the Business Process Management (BPM) engine to handle complex jurisdictional lines. 
* Write logic that can spawn parallel sub-tasks when a single grievance impacts multiple agencies.