# AI Event Concierge 🏨

An AI-powered full-stack web app that generates corporate event venue proposals from natural language descriptions.

**Live Demo:** https://your-app.vercel.app

---

## Features

- 🤖 AI-generated venue proposals using **Groq (Llama 3.1)**
- 💾 Persistent search history via **Supabase (PostgreSQL)**
- ⚡ Fast loading states and smooth animations
- 📱 Fully responsive design
- 🔄 History survives page refresh

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes |
| AI | Groq API — Llama 3.1 8B Instant (free) |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |

---

## Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ai-event-concierge.git
cd ai-event-concierge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

- **Groq API Key** → [console.groq.com](https://console.groq.com) → API Keys → Create Key (free, no card)
- **Supabase** → [supabase.com](https://supabase.com) → New Project → Settings → API

### 4. Set up the database

In your Supabase project, go to **SQL Editor** and run:

```sql
create table searches (
  id uuid default gen_random_uuid() primary key,
  user_query text not null,
  venue_name text,
  location text,
  estimated_cost text,
  why_it_fits text,
  created_at timestamp with time zone default now()
);
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables (same as `.env.local`) in the Vercel dashboard
4. Click **Deploy**

---

## Example Queries

- *"10-person leadership retreat in the mountains, 3 days, $4k budget"*
- *"50-person team building in Austin TX, 1 day, $8k budget"*
- *"200-person annual conference in NYC, 2 days, $50k budget"*