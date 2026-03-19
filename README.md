# Manga Shelf 📚

You all-in-one manga tracking application.

## Why This Exists

Started this project mainly to understand backend concepts more practically. I'm into cybersecurity and web exploitation, so understanding how backend systems work is pretty essential. Plus, I figured it'd be cool to make some backend-heavy sites of my own later.

## Tech Stack
- **Frontend:** React, Tailwind CSS.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
- **External Data:** MangaDex API for fetching manga covers and metadata.

## What's New?
The project just went through a huge architectural upgrade:
- **Database :** Fully migrated from MongoDB to **PostgreSQL** using **Prisma ORM**. Everything is now centralized and securely persistent.
- **Library Management:** Added library lists (Reading, Completed...) with dynamic filtering and sorting.
- **Interactivity:** A 5-star rating system and chapter progress tracking on the manga pages, and Profile pages now dynamically calculate stats based on your reading history.
- **Secuirity:** Strengthened Express backend with `helmet` (for security), rate limiting, and a robust testing workflow (Jest + Supertest).

## Setup & Running

### 1. Backend Setup
```bash
cd Backend
npm install
```
Create a `.env` file in the Backend directory with your database string and secrets:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/mangashelf"
PORT=5000
JWT_SECRET="your_super_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
```
Initialize the DB and start the server:
```bash
npx prisma db push
npm run dev
```

### 2. Frontend Setup
```bash
cd manga-shelf-react
npm install
```
Create a `.env` file in the React app directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the app:
```bash
npm run dev
```
Visit `http://localhost:5173` for the frontend (the backend hums along on port 5000).

## Future Ideas 
- [ ] **Reader page** - actually read manga chapters **locally** in the app
- [ ] **MyAnimeList API integration** - better statistics and merge user data from other platforms
- [ ] User profile customization & deeper statistics

### Long Term
- [ ] **Desktop app** - ship everything as a native desktop/mobile app
- [ ] Recommendations engine
- [ ] Social features (friends, sharing lists, etc.)

## Known Issues
- No pagination on search results yet (MangaDex returns a lot of data)
- Needs theme switch and language preference options

## Contributing
This is primarily a personal learning project, but if you have ideas or want to mess around with it, feel free to fork it.
