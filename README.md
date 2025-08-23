# Strava Lite

A lightweight fitness tracking web application that allows users to log activities, view their history, and receive AI-powered training suggestions. Built as a full-stack Next.js application with Supabase integration.

## 🏃‍♂️Features

### Core Fetures

* **Authentication** : Secure login via Supabase Auth (magic link or email/password)
* **Activity Logging** : Record runs and rides with title, date, duration, distance, effort level, and notes
* **Activity History** : View personal activity list in reverse chronological order with search and filtering
* **AI Suggestions** : Get personalized training recommendations based on recent activity patterns
* **Activity Management** : Edit and delete activities with optimistic UI updates
* **User Profile** : Display current user info with avatar/email and sign-out functionalites.

### Advanced Features

* **Derived Statistics** : Automatic calculation of pace (min/km) and speed (km/h)
* **Search & Filter** : Find activities by title, sport type, and date range
* **Pagination** : Efficient data loading with paginated activity lists
* **Weekly Summary** : Optional overview card showing total distance, average duration, and top sport
* **Soft Delete** : Activities are archived rather than permanently deleted
* **Personal Bests** : Track longest runs, fastest times, weekly distance records
* **Rate Limiting** : Implement request throttling (60/min per user)
* **Charts** : Weekly mileage visualization
* **Advanced Analytics** : Trend analysis and performance insights

## 🛠 Tech Stack

* **Framework** : [Next.js 14](https://nextjs.org/) with App Router
* **Language** : TypeScript
* **Styling** : [Tailwind CSS](https://tailwindcss.com/)
* **Database** : [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
* **Authentication** : Supabase Auth
* **Validation** : [Zod](https://zod.dev/) for API input validation
* **State Management** : Server Components + optional React Query
* **AI Integration** : Custom AI suggestion
* **Font** : [Geist](https://vercel.com/font) optimized with `next/font`

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* npm/yarn/pnpm/bun
* Supabase account and project
* Gemini API Key(for AI suggestions)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Bhavya-Ezio/Task-strava-lite.git
cd Task-strava-lite
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables:**

```bash
cp sample.env .env.local
```

Add your Supabase configuration to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

4. **Set up Supabase:**
   * Create tables for activities with RLS policies
   * Configure authentication providers
   * Set up database schema
5. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. **Open [http://localhost:3000](http://localhost:3000/) to view the application**

## 📁 Project Structure

```
Task-strava-lite/
├── docs/ (or ai-notes/)           # Dev notes, AI conversations
├── tests/                         # Playwright & other tests
src/
├── app/
│   ├── addActivity/             
│   ├── api/
│   │   ├── activities/route.ts       # GET all, POST new
│   │   ├── activities/[id]/route.ts  # GET one, PATCH, DELETE
│   │   ├── dashboard/route.ts
│   │   ├── getReport/route.ts
│   │   ├── profile/route.ts
│   │   ├── user/route.ts
│   │   └── suggestion/route.ts
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   ├── action.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Activities/
│   ├── Dashboard/
│   ├── Navbar/
│   ├── Profile/
│   ├── Report/
│   └── Suggestion/
├── context/
│   ├── UserContext.tsx
│   └── ActiveTabContext.tsx
├── lib/
│   └── supabase/
├── types/
└── public/

```

## 🔌 API Endpoints

### Activities

* `POST /api/activity` - Create new activity
* `GET /api/activities` - Get paginated user activities with search/filter
* `PATCH /api/activity/[id]` - Update existing activity
* `DELETE /api/activity/[id]` - Soft delete activity

### AI Suggestions

* `POST /api/suggestion` - Generate suggestion based on recent history

### Query Parameters (GET /api/activities)

* `search` - Search by activity title
* `sport` - Filter by sport type (Run/Ride)
* `from` - Start date filter
* `to` - End date filter
* `page` - Page number for pagination
* `pageSize` - Items per page

## 🤖 AI Suggestions

The AI suggestion system (using Gemini API) analyzes your recent activities (last 28 days) and provides personalized recommendations such as:

* "Easy 5K today for active recovery"
* "Time for a recovery ride - 45 min easy pace"
* "You're ready for a longer run this weekend"

Suggestions include rationale and are based on:

* Recent training volume
* Activity frequency
* Effort levels
* Recovery patterns

## 🔒 Security Features

* **Row Level Security (RLS)** : Database-level access control
* **Token Validation** : Server-side verification of Supabase tokens
* **Input Validation** : Zod schemas for API request validation
* **No Client Secrets** : All sensitive keys stored server-side
* **Ownership Checks** : Users can only access their own data

## 🎨 UI/UX Features

* **Responsive Design** : Mobile-first approach with Tailwind CSS
* **Loading States** : Loaders and progress indicators
* **Error Handling** : User-friendly error messages and fallbacks
* **Optimistic Updates** : Immediate UI feedback for better UX
* **Empty States** : Helpful guidance when no data is available
* **Accessibility** : WCAG compliant with proper ARIA labels

## 📊 Data Flow

1. **Authentication** : User signs in via Supabase Auth
2. **Activity Creation** : Form submission → API validation → Database storage
3. **Data Fetching** : Client requests → Token validation → RLS-filtered queries
4. **AI Processing** : Recent activities → Analysis → Personalized suggestions

## 🧪 Testing

## End-to-End (E2E) Testing

This project uses **Playwright** for end-to-end testing.

1. Install dependencies (if not already done):

```bash
npm install
```

2. Then run:

```bash
npm run test:e2e
```
