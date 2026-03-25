---
description: Steps to build AI Agent APIs for multimodal processing using Whisper, BLIP-2, BERT, and Hugging Face models.
---

# Build AI Agent APIs Workflow

This workflow guides the `@agent_ai` and `@agent_backend` through the process of building the AI multimodal processing API integration layer in the FastAPI backend, relying on configured environment variables (`WHISPER_API_KEY` and `HUGGING_FACE_API_KEY`). Both BERT and BLIP-2 will be accessed directly via the Hugging Face API.

## Prerequisites
- The FastAPI backend must be set up with an asynchronous architecture.
- Ensure the `.env` file in `/backend` contains the necessary active token keys:
  - `WHISPER_API_KEY`
  - `HUGGING_FACE_API_KEY`
- Understand the OmniGrievance directives in `AGENTS.md` and related `.agents/rules/`.

## Step 1: Implement the Voice Processing Service (Whisper)
- **Agent:** `@agent_ai`, `@agent_backend`
- **Task:** Create a service wrapped around the Whisper API to handle audio transcriptions.
- **Action Items:**
  - Create or update `/backend/app/services/audio_processing.py`.
  - Construct an `async def transcribe_audio(file: UploadFile)` method.
  - Use the `WHISPER_API_KEY` to authenticate and submit the byte stream.
  - Return standard UTF-8 text, handling regional dialects automatically.

## Step 2: Implement the Visual Intelligence Service (BLIP-2 via Hugging Face)
- **Agent:** `@agent_ai`, `@agent_backend`
- **Task:** Build the image ingestion and anomaly detection pipeline.
- **Action Items:**
  - Create `/backend/app/services/vision_processing.py`.
  - Extract EXIF GPS data (latitude/longitude) from the image file before processing.
  - Send the image bytes to the BLIP-2 inference endpoint via the Hugging Face API using the `HUGGING_FACE_API_KEY` header.
  - Parse the AI response to establish context (e.g., "pothole on a paved road", "overflowing garbage bin") and measure the civic anomaly severity.

## Step 3: Implement Semantic Intent & Emergency NLP (BERT via Hugging Face)
- **Agent:** `@agent_ai`, `@agent_backend`
- **Task:** Map grievances based on text meaning and spot high-stakes anomalies.
- **Action Items:**
  - Create `/backend/app/services/nlp_processing.py`.
  - Build an intent classifier utilizing BERT-based models via the Hugging Face API (using `HUGGING_FACE_API_KEY`).
  - **Emergency Override Rule (`emergency-override.md`):** Scan the payload for critical phrases ("live wire", "gas leak"). If detected, inject an `is_emergency=True` flag into the grievance mapping.

## Step 4: Wire AI Services to FastAPI Endpoints
- **Agent:** `@agent_backend`
- **Task:** Expose the ingestion logic via the API gateway.
- **Action Items:**
  - Create endpoints in `/backend/app/api/routers/ingestion.py`.
  - Ensure all endpoints (e.g., `POST /api/v1/ingest/multimodal`) strictly verify the user's role (RBAC Rule).
  - Chain the multimodal services. For example, if a user submits a voice note + image, first transcribe the voice, analyze the image, run the text through BERT intent modeling, then save to the exact PostGIS database seamlessly.

## Step 5: Write Functional Mock Tests
- **Agent:** `@agent_backend`
- **Task:** Ensure the external APIs degrade gracefully and error handling protects the civic queue.
- **Action Items:**
  - Mock API requests for the Hugging Face services in `/backend/tests/test_ai_services.py`.
  - Verify circuit-breakers (e.g., timeout fallbacks if the external endpoints are slow).
