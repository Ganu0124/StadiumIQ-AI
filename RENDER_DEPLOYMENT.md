# Render Deployment Guide for StadiumIQ AI 🚀

This guide explains how to deploy the Next.js **StadiumIQ AI** platform directly onto **Render.com**.

---

## 📋 Prerequisites
1. A **GitHub** account with your repository pushed.
2. A **Render** account (sign up at [Render.com](https://render.com)).
3. (Optional) A **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/)).

---

## ⚡ Deployment Steps

### 1. Link Repository
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New** in the top-right and select **Web Service**.
3. Link your GitHub account and select your `stadiumiq-ai` repository.

### 2. Configure Service
Render will automatically detect the Next.js setup, but make sure to apply the following parameters:

- **Name**: `stadiumiq-ai`
- **Region**: Select the region closest to your users.
- **Branch**: `main` (or `master`)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Instance Type**: Select **Free** (or Starter/Standard for higher performance).

---

## 🔑 Environment Variables
Under the **Advanced** settings on Render, add the following Environment Variable:

| Key | Value | Description |
| --- | ----- | ----------- |
| `NEXT_PUBLIC_GEMINI_API_KEY` | `your_api_key_here` | Your Google Gemini API token. |

---

## 📦 Dynamic Deployments using `render.yaml`
We have included a `render.yaml` blueprint file at the root of the project. This allows you to deploy with one click:
1. Navigate to the **Blueprints** tab in your Render dashboard.
2. Click **New Blueprint Instance**.
3. Select your repository.
4. Render will read the `render.yaml` file, set up the Node environment, configure the build settings, and deploy the site instantly.
