# BeyondChats – Full Stack Web Developer Assignment

This repository contains my submission for the **BeyondChats Full Stack Web Developer Intern assignment**, implementing blog scraping, REST APIs, AI-powered article updates, and a React-based frontend.

---

## 🚀 Live Project Links

- **Frontend (React App)**  
  👉 [https://YOUR_FRONTEND_URL.vercel.app](https://beyondchats-assignment-sigma.vercel.app/)  

- **Backend API**  
  👉 https://beyondchats-assignment-0nfm.onrender.com/api/articles  

The frontend displays both **original articles** and their **AI-updated versions** along with references.

---

## ⚙️ Local Setup Instructions

### 🔹 Prerequisites
- Node.js (v18+ recommended)
- npm


### 🔹 Backend Setup

```bash
cd backend
npm install
node db/setup.js
npm run dev

Backend runs at:
http://localhost:3000
```

### 🔹 Scripts to run

```bash
cd backend
node scraper/scrapeBeyondChats.js

cd backend
node scripts/updateArticles.js
```

### 🔹 Frontend Setup

```bash
cd frontend
npm install
npm run dev

Frontend runs at:
http://localhost:5173
```
---

## 🧠 Data Flow / Architecture Diagram

```bash
┌────────────────────┐
│  BeyondChats Blogs │
└─────────┬──────────┘
          │ Puppeteer Scraping
          ▼
┌────────────────────┐
│  SQLite Database   │
│ (Original Articles)│
└─────────┬──────────┘
          │
          │ REST APIs (CRUD)
          ▼
┌────────────────────┐
│  Node.js + Express │
│  Backend APIs      │
└─────────┬──────────┘
          │
          │ Automation
          │
          ▼
┌──────────────────────────────────────┐
│ Google Search (SerpAPI)              │
│ + External Article Scraping          │
│ + Groq LLM (Article Rewrite)         │
└─────────┬────────────────────────────┘
          │ Post Api publishing an updated article
          ▼
┌────────────────────┐
│ SQLite Database    │
│ (Updated Articles) │
└─────────┬──────────┘
          │ Axios to display
          ▼
┌────────────────────┐
│  React Frontend    │
│  (Vite + UI)       │
└────────────────────┘
```

---

## 📝 Project Summary

### 🔹 Phase 1 – Blog Scraping & APIs
- Scraped the oldest available articles from BeyondChats blogs using Puppeteer
- Filtered pagination and tag pages
- Extracted clean article content (excluding comments and metadata)
- Stored articles in SQLite
- Built full CRUD APIs using Express.js

Running Scraping Script (Phase 1)
```bash
cd backend
node scraper/scrapeBeyondChats.js
```
  

### 🔹 Phase 2 – AI Article Update Automation
- Fetches original articles via backend API
- Searches the article title on Google using SerpAPI
- Fetches the top 2 external blog/article links
- Scrapes main content from these external articles
- Uses Groq LLM to rewrite the original article to match the style and structure of higher-ranking content
- Publishes the updated article via backend APIs
- Stores reference URLs for citation transparency

Running Automation Script (Phase 2)
```bash
cd backend
node scripts/updateArticles.js
```

### ⚠️ Controlled Execution (Important)
#### Only ONE article is processed per execution due to :
- This behavior is intentional and implemented to prevent excessive LLM API usage.
- This can be easily extended to batch processing if required.



### 🔹 Phase 3 – Frontend (React)

- Built with React + Vite
- Displays Original articles and AI-updated articles
- Graceful loading and empty states and responsive layout

---

## 🧩 Notes
- SQLite is file-based; production deployments start with an empty database.
- Articles can be populated by running scraping or automation scripts.
- Some very old archived blog posts not exposed in the blog feed are intentionally excluded.

---
## 👤 Author
### Krish Khera

