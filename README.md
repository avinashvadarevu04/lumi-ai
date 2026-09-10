# Lumi AI Full-Stack Platform

Enterprise AI solutions showcase featuring a modern React frontend and Express REST API backend.

## Project Structure

```
lumi-ai/
├── frontend/                   # React + Vite client application
│   ├── src/                    # Components, animations, pages, styles
│   │   ├── components/         # Hero, Navbar, Sections, ContactModal, etc.
│   │   └── index.css           # Tailwind + Custom Design System CSS
│   ├── public/                 # Static assets & 3D models
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite config with /api reverse proxy
│   └── package.json            # Frontend dependencies
│
├── backend/                    # Express.js REST API service
│   ├── src/
│   │   ├── routes/             # Health and Contact API routes
│   │   └── server.js           # Express server entry point (port 5001)
│   ├── .env.example            # Environment variable template
│   └── package.json            # Backend dependencies
│
├── dev.sh                      # Unified one-click runner for both services
└── package.json                # Root workspace orchestrator
```

## Quick Start

### 1. Run Both Services Concurrently
```bash
./dev.sh
```
Or via npm workspaces:
```bash
npm run dev:all
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:5001](http://localhost:5001)

### 2. Run Services Individually

**Frontend only:**
```bash
npm run dev:frontend
# or: cd frontend && npm run dev
```

**Backend only:**
```bash
npm run dev:backend
# or: cd backend && npm run dev
```

### 3. Build for Production

```bash
npm run build
# or: cd frontend && npm run build
```

## API Endpoints

- `GET /api/health` — Service health check and uptime.
- `POST /api/contact` — Receives enterprise consultation requests from `ContactModal`.
- `GET /api/contact` — View recent consultation submissions (administrative/debugging).
