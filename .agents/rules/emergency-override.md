---
trigger: always_on
---

---
name: emergency-override
description: Logic for detecting and escalating critical civic emergencies.
trigger: "When writing ingestion logic, routing logic, or NLP processing pipelines."
---

# Rule: Emergency Triage Override

1. [cite_start]**Keyword Spotting:** The system must implement sentiment analysis to detect high-stakes keywords such as "live wire", "gas leak", or "structural collapse" in the incoming text or transcribed voice notes[cite: 38, 92].
2. [cite_start]**Bypass Standard Queues:** If these keywords are detected, the issue MUST bypass standard SLA queues[cite: 39, 92].
3. [cite_start]**Immediate Escalation:** Trigger immediate emergency notifications to supervisors and emergency responders[cite: 39].