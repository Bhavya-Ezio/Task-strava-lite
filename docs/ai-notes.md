# 🤖 AI-NOTES.md

This file contains architectural notes, design decisions, and testing approaches for the **Strava-lite** project.
It acts as a reference for contributors and for future maintainability.

---

## 📂 Project Overview

- **Stack**: Next.js (App Router) + Supabase + TypeScript + TailwindCSS + Framer Motion
- **Purpose**: A lightweight Strava clone for tracking running and cycling activities, with weekly reports and profile stats.

---

## 🗄️ Database Schema

### Activites

```sql
create table public.activities (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text check (type in ('run','ride')),
  distance_km numeric(5,2),
  duration_min numeric,
  notes text,
  created_at timestamptz default now(),
  title text,
  deleted boolean default false, -- soft delete support
  primary key (id)
);
```


### Profiles

* Stores total_distance,total_time, avg_speed, longest_run (auto-updated whenever an activity is added/edited/deleted).


## 🔑 Auth & User Context

* A custom `UserProvider` fetches `/api/user` on load.
* If no valid cookie → redirect to `/login`.
* Exposes `user` and `loader` states via React Context.


## 🛠️ API Routes

* `POST /api/activity` → Add activity (validated with Zod).
* `PATCH /api/activity/:id` → Update activity and cascade stats update in `profiles`.
* `DELETE /api/activities/:id` → Soft delete (sets `deleted=true`) and cascade update in `profiles`.
* `GET /api/activities` → Fetch activities (only `deleted=false`).
* `GET /api/getReport` → On-the-fly aggregation of weekly stats (no extra table).

---

## ✅ Validation

All API inputs are validated with  **Zod** :

```Ensures
const activitySchema = z.object({
  title: z.string().min(1).max(100),
  type: z.enum(["run", "ride"]),
  distance_km: z.number().positive(),
  duration_min: z.number().positive(),
  notes: z.string().max(500).optional(),
});

```

* Prevents invalid DB writes
* Ensures consistent & safe data entry.


## 🧪 Testing Strategy

* **Playwright E2E tests** in `tests/e2e.spec.ts`.
  * Flow: Login → Add Activity → Edit Activity → Delete Activity → Assert updates in UI.
  * Uses role/placeholder selectors instead of brittle text locators.


## ⏱️ Rate Limiting

Implemented middleware (or API wrapper) for per-user/IP throttling:

* Limit: `60 requests/min`.
* On violation: return `429 { error: "Rate limit exceeded" }`.
* Tested by firing multiple parallel requests in Playwright.

---

## 🎨 Frontend Notes

* **Motion Layouts** : Page transitions via `framer-motion`.
* **Toastify** : Used for success/error alerts (rules: short messages, auto-dismiss, error in red, success in green).
* **Activity List** : Shows `Today`, `Yesterday`, `2 days ago`, etc. using relative date formatting.

---

## 🚧 Known Issues / To-Do

* ⏳ Login flow: cookies take a moment to set; tests must `waitForURL("/dashboard")` before continuing.
* 📝 Weekly Report: currently computed on-the-fly; may add caching if performance drops.
* 🔐 Rate limiting per-user still allows multiple tabs; may add Redis for stricter global tracking.
