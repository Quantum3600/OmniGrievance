---
description: Steps to containerize and spin up the complete MVC stack locally.
---

---
name: deploy-local-prototype
description: Steps to containerize and spin up the complete MVC stack locally.
---

# Workflow: Deploy Local MVC Prototype

Follow these steps to prepare the application for local testing and simulate the production cloud-native environment:

1. [cite_start]**Write Frontend Dockerfile:** Create a `Dockerfile` for the Next.js frontend application[cite: 64, 76].
2. [cite_start]**Write Backend Dockerfile:** Create a `Dockerfile` for the FastAPI Python backend[cite: 67, 76].
3. [cite_start]**Configure Docker Compose:** Create a `docker-compose.yml` file in the root directory[cite: 76, 110].
4. [cite_start]**Integrate Services:** Ensure the `docker-compose.yml` includes the frontend, backend, a PostgreSQL database (with the PostGIS image), and a Redis instance[cite: 73, 74].
5. [cite_start]**Network Bridging:** Configure the networking so the FastAPI backend can securely communicate with the database, cache, and frontend containers[cite: 62].