---
name: postgis-spatial-routing
description: Instructions for database schema design and spatial query logic.
trigger: "When writing SQL queries, defining SQLAlchemy models, or configuring database interactions."
---

# Skill: Database & PostGIS Spatial Triage

## 1. Database Standards
* **Core Engine:** Use PostgreSQL to maintain strict ACID compliance for all public records.
* **Spatial Extension:** You MUST use the PostGIS extension for all location-based data storage and querying.

## 2. Spatial Triage Logic
* **Jurisdiction Matching:** Write spatial queries to automatically match a grievance's location to the specific nodal officer responsible for that geographic jurisdiction.
* **Objective:** This automated spatial routing must completely eliminate the need for manual administrative triage.

## 3. Performance
* For real-time executive dashboards, write logic to utilize Redis for in-memory caching to achieve millisecond latency.