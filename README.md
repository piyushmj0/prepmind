# PrepMind — AI-Powered Interview Strategist

> Upload your resume + paste a job description → get a personalized interview strategy powered by Gemini AI.

**Live App:** [https://prepmind2001.netlify.app](https://prepmind2001.netlify.app)

---

## Tech Stack

### Frontend
- React 19 + Vite + React Router
- SCSS with CSS custom properties (design token system)
- Three.js / @react-three/fiber — 3D animated hero
- Framer Motion — scroll-triggered animations
- Lucide React — icons
- Axios — API client
- Deployed on **Netlify** (auto-deploy from GitHub `main`)

### Backend
- Node.js + Express
- MongoDB Atlas — user data & interview reports (sub-200ms indexed queries)
- Redis — rate limiting + 6-hour report caching
- Gemini AI (`@google/genai`) — report generation
- JWT auth via HTTP-only cookies
- Deployed on **AWS EC2** via **Docker Compose**

---

## Architecture

```
Browser (Netlify CDN)
  └── /api/* proxy ──→ AWS EC2 (15.135.137.119:3000)
                          ├── Node.js Backend (port 3000)
                          └── Redis (port 6379)
                                    │
                              MongoDB Atlas (cloud)
```

---

## Features

| Feature | Description |
|---------|-------------|
| Match Score | % compatibility between resume and job |
| Technical Questions | Role-specific interview questions |
| Behavioral Questions | Soft-skill situational questions |
| Skill Gap Analysis | Missing skills to target |
| Day-wise Prep Plan | Multi-day structured study plan |
| Secure Auth | JWT + HTTP-only cookie sessions |

---

## Local Development

### Prerequisites
- Node.js 22+
- Docker Desktop

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Backend + Redis (Docker)
```bash
# Create backend/.env with your credentials (see .env.example)
docker compose up --build
```

Backend runs on `http://localhost:3000`  
Frontend dev server on `http://localhost:5173`

---

## Environment Variables

Create `backend/.env`:
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
GOOGLE_GENAI_API_KEY=...
EMAIL_USER=...
EMAIL_PASS=...
FRONTEND_URL=https://prepmind2001.netlify.app
REDIS_URL=redis://redis:6379
PORT=3000
```

---

## Deployment

| Layer | Platform | Method |
|-------|----------|--------|
| Frontend | Netlify | Auto-deploy on `git push` to `main` |
| Backend | AWS EC2 (t2.micro) | Docker Compose (`restart: always`) |
| Database | MongoDB Atlas | Cloud managed |
| Cache | Redis 7 (Docker) | Co-located with backend |

---

## Performance

- MongoDB connection pool: min 10 / max 50 sockets
- Redis report cache: 6-hour TTL
- Indexed queries on `email`, `token`, `userId + createdAt`
- Avg query time: ~25-33ms (single), ~199ms (5 parallel)
- Frontend: lazy-loaded routes, 3D canvas paused off-screen, DPR capped at 1.5

---

Built with ❤️ using React, Node.js, Docker & AWS
