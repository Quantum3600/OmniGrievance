---
name: ai-multimodal-orchestration
description: Directives for integrating and utilizing ML models for the Zero-Friction intake.
trigger: "When writing services that process natural language, audio, or images."
---

# Skill: AI Orchestration & Processing

## 1. Voice Processing
* **Integration:** Implement service wrappers for the Whisper and Bhashini APIs.
* **Function:** Transcribe voice notes in regional dialects and translate vernacular speech into standardized text.

## 2. Visual Intelligence
* **Model:** Utilize BLIP-2 Vision-Language Models.
* **Function:** Process uploaded images to detect civic anomalies, assess severity, and automatically extract EXIF GPS data.

## 3. Semantic Intent Routing
* **Model:** Utilize BERT-based NLP models.
* **Function:** Analyze the text payload to understand contextual meaning and automate intent classification, replacing manual drop-down categories. 

## 4. Emergency Override
* **Trigger:** If high-stakes keywords (e.g., "live wire") are detected via sentiment analysis, bypass standard queues and trigger immediate emergency notifications.