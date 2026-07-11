# StadiumIQ AI 🏟️🤖

[![Build & Verification Pipeline](https://github.com/Ganu0124/StadiumIQ-AI/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ganu0124/StadiumIQ-AI/actions/workflows/deploy.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.dotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat&logo=react)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-API_v2-red?style=flat&logo=googlegemini)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **StadiumIQ AI** is a state-of-the-art, enterprise-grade stadium management and fan logistics dashboard built for **FIFA World Cup 2026™ operations**. It consolidates fragmented operational silos into a single, real-time command console powered by Google Gemini.

---

## 📖 Table of Contents
1. [Overview & Solution](#-overview--solution)
2. [Key Command Modules](#-key-command-modules)
3. [Tech Stack](#%EF%B8%8F-tech-stack)
4. [Project Structure](#-project-structure)
5. [Getting Started](#-getting-started)
6. [Deployment Blueprint](#-deployment-blueprint)
7. [API Integrations](#-api-integrations)
8. [Author & Contact](#-author--contact)

---

## 💡 Overview & Solution

Large-scale sporting events struggle with crowd surges, long queues, security emergencies, concessions supply delays, and medical dispatch latency. 

**StadiumIQ AI** addresses these problems by aggregating real-time sensor streams and telemetry data:
* **Generative Triage Plans**: Automatically drafts tactical playbooks using Gemini.
* **Multilingual Communications**: Instantly translates emergency broadcasts and fan responses.
* **Predictive Queues**: Tracks gate load factors to preempt congestions.

---

## 🏟️ Key Command Modules

Our dashboard includes **16 specialized command panels** tailored to FIFA stadium workflows:

| Module | Purpose | Features |
| --- | --- | --- |
| 📊 **Executive Dashboard** | Core operations hub | Dynamic match calendars, live gates load, active priority alarm widgets, master CSV exporter. |
| 👥 **Crowd Intelligence** | Entrance queue tracking | 15-minute predictive wait-time models & staff rerouting dispatch options. |
| 🔒 **Security Center** | Perimeter surveillance | AI drone telemetry feeds, threat levels, and security SOP playbooks. |
| 🚑 **Medical Response** | Incident triage | Paramedic location mapping, patient priority level queues, response checklist. |
| 🚗 **Parking Management** | Traffic flow coordination | Lot occupancy logs, EV charging indicators, and dynamic highway routing sign boards. |
| 🍔 **Food & Vendors** | Concessions restocking | High-sales tracking charts, low-stock alarms, and supply transit routes. |
| 📢 **Announcements** | Multilingual emergency PA | Broadcast creation with auto-translation (English, Spanish, French, Portuguese). |
| 💬 **Fan Concierge** | AI assistant chat | Multilingual virtual fan support bot. |

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 16 (App Router with Turbopack compilation)
* **User Interface**: React 19, Vanilla CSS (Premium FIFA Dark Mode theme)
* **Icons & Assets**: Lucide React
* **Data Visualization**: Recharts (Dynamic Area, Bar, and Donut charts)
* **Intelligence Layer**: Google Gemini SDK (`@google/genai`)

---

## 📁 Project Structure

```bash
stadiumiq-ai/
├── src/
│   ├── app/                      # Next.js pages & API routes
│   │   ├── (auth)/               # Login & Forgot Password screens
│   │   ├── api/                  # JSON DB read/write endpoints
│   │   └── dashboard/            # 16 Command modules
│   ├── components/
│   │   ├── dashboard/            # KPI cards & Activity feeds
│   │   ├── layout/               # Sidebar & Topbar components
│   │   ├── charts/               # Recharts adapters
│   │   └── maps/                 # Interactive SVG maps
│   ├── constants/                # Project constants
│   ├── context/                  # AuthContext Provider
│   ├── data/                     # Persistent JSON Database
│   ├── lib/                      # Exporter utilities
│   └── services/                 # Google Gemini API client
```

---

## 🚀 Getting Started

### 1. Environment Set Up
Clone the project and copy the template:
```bash
cp .env.example .env
```
Define your Gemini token:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
# Windows PowerShell workaround
cmd /c "npm run dev"
```
Navigate to [http://localhost:3000](http://localhost:3000) to preview.

### 🔑 Test Credentials
Log in with:
* **Email**: `admin@stadium.com`
* **Password**: `password123`

---

## 📦 Deployment Blueprint

### Render.com Deployment
The repository includes a custom `render.yaml` configuration.
1. Connect this repo to your [Render Dashboard](https://render.com).
2. Render will automatically detect the `Dockerfile` and configure a clean Node container environment.
3. Configure `NEXT_PUBLIC_GEMINI_API_KEY` in Render environment variables.
4. Click deploy. Refer to [RENDER_DEPLOYMENT.md](file:///d:/projects/stadiumiq-ai/RENDER_DEPLOYMENT.md) for more details.

---

## 🤝 Author & Contact

Developed by **Ganesh M** with a commitment to next-generation sports operations technology.

* **Author**: Ganesh M
* **Email**: [gganu86152@gmail.com](mailto:gganu86152@gmail.com)
* **GitHub**: [@Ganu0124](https://github.com/Ganu0124)
* **Project Page**: [StadiumIQ-AI](https://github.com/Ganu0124/StadiumIQ-AI)

---

## 📄 License
This project is licensed under the MIT License. See `LICENSE` for details.
