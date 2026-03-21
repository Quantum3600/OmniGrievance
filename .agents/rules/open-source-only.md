---
trigger: always_on
---

---
name: open-source-only
description: Prohibits the use of proprietary vendor libraries.
trigger: "When adding new dependencies or suggesting architectural changes."
---

# Rule: Open-Source Mandate

1. [cite_start]**Data Sovereignty:** To ensure long-term feasibility and avoid proprietary vendor lock-in, the system must be built entirely on proven, open-source frameworks[cite: 57].
2. [cite_start]**Restriction:** Do not import, install, or suggest any proprietary SDKs, closed-source cloud services (where an open alternative exists), or paid external processing APIs unless explicitly authorized by the developer[cite: 57, 58].