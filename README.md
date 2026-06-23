# Mini CRM Opportunity Tracker

A full-stack MERN application for tracking a shared sales opportunity pipeline. Built for the CEO Factory / Dwison Advisory MERN Stack Developer Assignment.

## 1. Project Overview

This is an internal CRM-style tool that lets a team of logged-in users:

- Securely register and log in (JWT + bcrypt)
- View a **shared** pipeline of sales opportunities created by anyone on the team
- Create new opportunities (always attributed to the logged-in user via the backend, never the client)
- Edit and delete **only their own** opportunities — enforced in the backend, not just hidden in the UI
- Filter by stage/priority, search, sort, and see pipeline summary stats

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| Styling | Plain CSS (custom design system, no framework) |

## 3. Project Structure

```
mini-crm/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/ (authController.js, opportunityController.js)
│   │   ├── middleware/ (authMiddleware.js, errorMiddleware.js, validators.js)
│   │   ├── models/ (User.js, Opportunity.js)
│   │   ├── routes/ (authRoutes.js, opportunityRoutes.js)
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/ (Navbar, OpportunityCard (row), OpportunityForm, Modal, ProtectedRoute)
    │   ├── context/AuthContext.jsx
    │   ├── pages/ (Login, Register, Dashboard)
    │   ├── services/api.js
    │   ├── utils.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

## 4. Backend Setup

```bash
cd backend
cp .env.example .env
# edit .env with your real MongoDB URI and a strong JWT secret
npm install
npm run dev        # nodemon, for local development
# or
npm start          # plain node, for production
```

The server starts on `http://localhost:5000` by default (configurable via `PORT`).

### Environment variables (backend/.env)

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Port the API listens on (default 5000) |
| `MONGO_URI` | MongoDB connection string (MongoDB Atlas recommended) |
| `JWT_SECRET` | Long random string used to sign JWTs — never commit a real value |
| `JWT_EXPIRES_IN` | Token expiry, e.g. `2h` |
| `CLIENT_ORIGIN` | Comma-separated list of allowed frontend origin(s) for CORS |

## 5. Frontend Setup

```bash
cd frontend
cp .env.example .env
# edit .env to point at your backend API
npm install
npm run dev         # local dev server (Vite)
npm run build        # production build to dist/
```

### Environment variables (frontend/.env)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` or your deployed Render URL + `/api` |

## 6. API Reference

All `/api/opportunities` routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | Returns `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ token, user }` |
| GET | `/api/auth/me` | — | Returns current user profile (requires token) |

### Opportunities

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/api/opportunities` | Any logged-in user | Query params: `stage`, `priority`, `search`, `sortBy`, `sortOrder`, `page`, `limit` |
| GET | `/api/opportunities/:id` | Any logged-in user | Single opportunity |
| POST | `/api/opportunities` | Any logged-in user | `owner` is derived from the JWT — request body is ignored for identity |
| PUT | `/api/opportunities/:id` | Owner only | 403 if you don't own it |
| DELETE | `/api/opportunities/:id` | Owner only | 403 if you don't own it |

#### Opportunity payload fields

```json
{
  "customerName": "Acme Corp",
  "contactName": "Jane Doe",
  "contactEmail": "jane@acme.com",
  "contactPhone": "+91 98765 43210",
  "requirement": "Needs a CRM integration",
  "estimatedValue": 50000,
  "stage": "New",
  "priority": "Medium",
  "nextFollowUpDate": "2026-07-01",
  "notes": "Internal notes"
}
```

`stage` enum: `New, Contacted, Qualified, Proposal Sent, Won, Lost`
`priority` enum: `Low, Medium, High`

## 7. Security Notes

- Passwords are hashed with bcrypt (10 salt rounds) before being saved — never stored in plain text.
- JWT is signed server-side with `JWT_SECRET` and expires after `JWT_EXPIRES_IN` (default 2h).
- The backend **never trusts** `user_id`, `owner`, or `created_by` from the request body. The `owner` field on create is always set from `req.user.id`, which itself comes only from a verified JWT.
- `PUT`/`DELETE` on an opportunity independently re-check `opportunity.owner === req.user.id` server-side — the frontend hiding the Edit/Delete buttons for non-owners is a UX convenience only, not the actual security boundary.
- All opportunity routes sit behind the `protect` middleware (JWT required).
- CORS is restricted to `CLIENT_ORIGIN` in production.

## 8. Deployment Steps

### Database — MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access (or `0.0.0.0/0` for simplicity).
3. Copy the connection string into `MONGO_URI`.

### Backend — Render / Railway
1. Push this repo to GitHub.
2. Create a new Web Service, root directory `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables from the table above (`MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN`, `NODE_ENV=production`).
5. Deploy and note the live backend URL (e.g. `https://your-app.onrender.com`).

### Frontend — Vercel / Netlify
1. Import the repo, root directory `frontend`.
2. Build command: `npm run build`. Output directory: `dist`.
3. Add `VITE_API_BASE_URL=https://your-backend-url.onrender.com/api`.
4. Deploy, then go back to the backend's `CLIENT_ORIGIN` env var and set it to this frontend URL, then redeploy the backend.

## 9. Known Limitations / Possible Future Improvements

- No Kanban board view yet (list/table view only).
- No activity/follow-up history log per opportunity — only a single `notes` field.
- No automated tests included.
- No rate limiting on auth endpoints.
- Pagination uses simple page/limit query params rather than cursor-based pagination.
- No password reset / email verification flow.
