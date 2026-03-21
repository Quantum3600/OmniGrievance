---
trigger: always_on
---

---
name: mandatory-proof
description: Enforces the mandatory photographic proof logic for ticket resolution.
trigger: "When writing backend logic, database updates, or UI for resolving/closing a grievance."
---

# Rule: Mandatory Photographic Proof

1. [cite_start]**Zero-Exception Policy:** Resolving officers are required to upload a photo of the completed work via the mobile app before a ticket can be closed[cite: 47].
2. [cite_start]**Backend Enforcement:** The backend API MUST NOT allow a status update to "resolved" or "closed" without a valid image payload attached to the request[cite: 47, 95].