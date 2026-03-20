# SkillNest 🪴

> A skill discovery platform for tier 3 and 4 college students.

Built to solve a real problem — talented students in colleges who never find each other because of social barriers, introversion, and no structured way to discover who knows what.

## What it does

- Students create a profile with skills they **have** and skills they **want to learn**
- Platform calculates a **match score** between students based on skill overlap
- Students can **send connection requests** — contact info only revealed after **both** accept
- Designed for introverts — no forced socialising, just quiet discovery

## Tech stack

- **Frontend** — HTML, CSS, Vanilla JavaScript
- **Backend** — Supabase (PostgreSQL database + Auth)
- **Hosting** — Vercel (free)
- **Auth** — Supabase email authentication

## Project structure

```
skillnest/
├── index.html          # Page structure
├── css/
│   └── style.css       # All styling
├── js/
│   ├── supabase.js     # DB connection + shared helpers
│   ├── auth.js         # Signup, signin, signout
│   ├── profile.js      # Create and edit profiles
│   ├── discover.js     # Browse profiles + modal
│   ├── connections.js  # Send/accept/decline requests
│   └── app.js          # Page routing + init
└── README.md
```

## Features

- Email based authentication
- Skill match algorithm
- Mutual connection system — contact locked until both accept
- Real time stats from database
- Fully responsive

## Built by

A 3rd year CS student from Lucknow solving a real problem they faced.
