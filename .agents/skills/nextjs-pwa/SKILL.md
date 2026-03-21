---
name: nextjs-pwa-frontend
description: Standard operating procedure for building the OmniGrievance React/Next.js frontend.
trigger: "When working in the /frontend directory or building UI components."
---

# Skill: Next.js PWA & Accessible UI Development

## 1. Core Framework Constraints
* **Framework:** Strictly use React.js and Next.js with the App Router architecture.
* **Rendering:** Prioritize Server-Side Rendering (SSR) to guarantee extremely fast load times, which is critical for the PWA to function on low-bandwidth rural networks.
* **Styling & Accessibility:** You MUST use Tailwind CSS and `shadcn/ui` components exclusively to ensure compliance with government web accessibility standards. Do not write custom CSS unless absolutely necessary.

## 2. Component Guidelines
* **Zero-Friction UX:** Build forms and interfaces that minimize cognitive load.
* **Multimodal Intake Forms:** The citizen intake UI must seamlessly accept text, image uploads, and audio recordings.
* **Real-Time Tracking:** Implement e-commerce style visual trackers for the citizen dashboard.