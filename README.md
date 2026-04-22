# PetPal - Pet Care Tracker

A full-stack MERN application for tracking pets and their care activities (feeding, walks, vet visits, grooming, medication). Users can register their pets, log care activities, and receive real-time updates via WebSockets when activities are added or pets are updated.

> **Course:** Trends in Technology — W2026 Full-Stack Project
> **Stack:** MongoDB, Express, React (Vite), Node.js, Socket.IO

---

## Features

- JWT-based authentication with bcrypt password hashing
- Protected routes via Express middleware
- RESTful API design
- 3 data models: **User**, **Pet** (full CRUD), **CareActivity** (full CRUD)
- Real-time WebSocket events (Socket.IO):
  - `activity:created` — broadcast when a new care activity is logged
  - `pet:updated` — broadcast when pet info changes
  - `notification:reminder` — send in-app reminders when an upcoming activity is due
- React frontend with protected routes and live UI updates
- GitHub Actions CI pipeline (lint + test on every push/PR)
- Ready for Render deployment (backend = Web Service, frontend = Static Site)

---

## Project Structure

```
petpal/
├── backend/                 # Node + Express + MongoDB API
│   ├── src/
│   │   ├── models/          # User, Pet, CareActivity (Mongoose schemas)
│   │   ├── routes/          # auth, pets, activities
│   │   ├── middleware/      # JWT auth middleware
│   │   ├── sockets/         # Socket.IO handlers
│   │   └── server.js        # Express + HTTP + Socket.IO entrypoint
│   ├── tests/               # Jest + Supertest smoke tests
│   ├── package.json
│   └── .env.example
├── frontend/                # React (Vite) SPA
│   ├── src/
│   │   ├── pages/           # Login, Register, Dashboard, PetDetail
│   │   ├── components/      # Navbar, PetCard, ActivityForm, etc.
│   │   ├── context/         # AuthContext, SocketContext
│   │   ├── api/             # axios client
│   │   └── App.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── .github/workflows/ci.yml # GitHub Actions CI pipeline
├── render.yaml              # Render infra-as-code (optional)
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 20+
- A MongoDB Atlas connection string (free tier is fine)

### 1. Clone and install
```bash
git clone <your-repo-url> petpal
cd petpal

# Backend
cd backend
cp .env.example .env          # then fill in MONGODB_URI and JWT_SECRET
npm install

# Frontend (in another terminal)
cd ../frontend
cp .env.example .env          # VITE_API_URL=http://localhost:5000
npm install
```

### 2. Run in dev
```bash
# Terminal 1
cd backend && npm run dev     # http://localhost:5000

# Terminal 2
cd frontend && npm run dev    # http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable       | Description                                | Example                                    |
| -------------- | ------------------------------------------ | ------------------------------------------ |
| `PORT`         | Backend port                               | `5000`                                     |
| `MONGODB_URI`  | MongoDB Atlas connection string            | `mongodb+srv://user:pass@cluster/petpal`   |
| `JWT_SECRET`   | Secret key for signing JWTs                | `change-me-to-a-long-random-string`        |
| `JWT_EXPIRES`  | Token expiry                               | `7d`                                       |
| `CLIENT_URL`   | Frontend URL (for CORS + Socket.IO)        | `https://petpal-frontend.onrender.com`     |

### Frontend (`frontend/.env`)
| Variable       | Description                   | Example                                   |
| -------------- | ----------------------------- | ----------------------------------------- |
| `VITE_API_URL` | Deployed backend URL          | `https://petpal-backend.onrender.com`     |

> `.env` files are gitignored. **Never commit real secrets.**

---

## API Reference

### Auth (User model)
| Method | Endpoint            | Auth | Description              |
| ------ | ------------------- | ---- | ------------------------ |
| POST   | `/api/auth/signup`  | No   | Create account           |
| POST   | `/api/auth/login`   | No   | Log in, returns JWT      |
| GET    | `/api/auth/me`      | Yes  | Get current user         |

### Pets (full CRUD)
| Method | Endpoint           | Auth | Description           |
| ------ | ------------------ | ---- | --------------------- |
| POST   | `/api/pets`        | Yes  | Create pet            |
| GET    | `/api/pets`        | Yes  | List owned pets       |
| GET    | `/api/pets/:id`    | Yes  | Get pet by id         |
| PUT    | `/api/pets/:id`    | Yes  | Update pet            |
| DELETE | `/api/pets/:id`    | Yes  | Delete pet            |

### Care Activities (full CRUD)
| Method | Endpoint                 | Auth | Description                      |
| ------ | ------------------------ | ---- | -------------------------------- |
| POST   | `/api/activities`        | Yes  | Log a care activity              |
| GET    | `/api/activities`        | Yes  | List activities (`?petId=` opt.) |
| GET    | `/api/activities/:id`    | Yes  | Get activity by id               |
| PUT    | `/api/activities/:id`    | Yes  | Update activity                  |
| DELETE | `/api/activities/:id`    | Yes  | Delete activity                  |

### WebSocket Events
Client connects to the backend origin with an auth token. Server emits:
- `activity:created` — payload: the new activity
- `pet:updated` — payload: the updated pet
- `notification:reminder` — payload: `{ petId, message, dueAt }`

---

## Deployment (Render)

### Backend — Web Service
1. New → Web Service → connect your GitHub repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Environment Variables:** set `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES`, `CLIENT_URL`.
6. Copy the deployed URL (e.g. `https://petpal-backend.onrender.com`).

### Frontend — Static Site
1. New → Static Site → same repo.
2. **Root Directory:** `frontend`
3. **Build Command:** `npm install && npm run build`
4. **Publish Directory:** `dist`
5. **Environment Variables:** `VITE_API_URL=<backend URL from step 6 above>`.

After both deploys are live, update the backend's `CLIENT_URL` to the static-site URL so CORS + Socket.IO handshakes succeed, and redeploy the backend.

### Optional: `render.yaml`
The repo includes a `render.yaml` blueprint so you can create both services in one click via Render's Blueprint workflow.

---

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and PR:
- Installs backend + frontend deps
- Lints both packages
- Runs backend tests (`npm test`)
- Builds the frontend (`npm run build`)

Merges to `main` are blocked by branch protection if any step fails. Render auto-deploys both services on push to `main` once connected.

---

## Demo Accounts (for the video)

After deployment, seed a couple of accounts via the UI and record:
1. Signup flow → Login flow → `/api/auth/me`.
2. Create a pet, update it, delete it (CRUD on Pet).
3. Log activities, edit, delete (CRUD on CareActivity).
4. Open two browser windows logged in as the same user → create an activity in one → watch it appear in the other via `activity:created` WebSocket event.
5. Update a pet → watch `pet:updated` push to the other window.

---

## License
MIT — for educational use.
