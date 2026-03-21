---
description: Steps to test the BPM engine's multi-agency routing capabilities.
---

---
name: simulate-parallel-dispatch
description: Steps to test the BPM engine's multi-agency routing capabilities.
---

# Workflow: Simulate Parallel Multi-Agency Dispatch

Follow these steps to build and test parallel workflow logic:

1. [cite_start]**Mock Complex Grievance:** Create a mock JSON payload representing a complex issue (e.g., "a broken water pipe causing a road hazard")[cite: 37].
2. [cite_start]**Implement BPM Logic:** Write the Python logic in the orchestration layer to detect multiple departmental overlaps based on the semantic intent[cite: 35, 37].
3. [cite_start]**Spawn Parallel Tasks:** Use asynchronous processing to automatically spawn parallel sub-tasks for different departments (e.g., Water Department and Public Works)[cite: 37].
4. [cite_start]**Track Dependencies:** Ensure the database schema and logic can track these dependencies simultaneously so the parent ticket remains open until all sub-tasks are resolved[cite: 37].