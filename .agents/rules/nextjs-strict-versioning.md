---
trigger: always_on
---

---
name: nextjs-strict-versioning
description: Forces the agent to consult local documentation for Next.js to avoid hallucinating deprecated APIs.
trigger: "When writing any Next.js routing, data fetching, or component logic in the /frontend directory."
---

# Rule: Next.js Version Strictness

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.