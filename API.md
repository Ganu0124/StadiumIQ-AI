# API Route Integration Guide

The StadiumIQ AI platform exposes endpoints designed to process operational alerts and format responses using Gemini-assisted prompts.

## 1. Incident Decision Support
* **Endpoint**: `/api/ai/summarize`
* **Method**: `POST`
* **Payload**:
  ```json
  {
    "incidentId": "INC-001",
    "description": "Unusual crowd density detected near Gate B1."
  }
  ```
* **Response**:
  ```json
  {
    "summary": "AI Summary: Critical crowd surge at Gate B1...",
    "recommendation": "Open auxiliary lanes and redirect traffic..."
  }
  ```

## 2. Multilingual Announcement Builder
* **Endpoint**: `/api/ai/announce`
* **Method**: `POST`
* **Payload**:
  ```json
  {
    "scenario": "Gate B1 Congestion",
    "languages": ["en", "es"]
  }
  ```
* **Response**:
  ```json
  {
    "en": "Gate B1 is congested. Please use Gate A2.",
    "es": "La puerta B1 está congestionada. Use la puerta A2."
  }
  ```
