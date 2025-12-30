# Manga Shelf - Develogs 

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup
```bash
cd Backend
npm install

# Create .env file with *your* :
# PORT=5000
# MONGODB_URI=mongodb_connection_string
# JWT_ACCESS_SECRET=secret
# JWT_REFRESH_SECRET=refresh_secret
# JWT_ACCESS_EXPIRES_IN=15m
# JWT_REFRESH_EXPIRES_IN=7d

npm run dev
```

### Frontend Setup
```bash
cd manga-shelf-react
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:5000

npm run dev
```

Visit `http://localhost:5173` for the frontend, backend runs on `http://localhost:5000`.


## Why This Exists

Started this project mainly to understand backend concepts more practically. I'm into cybersecurity and web exploitation, so understanding how backend systems work is pretty essential. Plus, I figured it'd be cool to make some backend-heavy sites of my own later.



## Current Version - The Big React Pivot

This project has had **many more iterations** than intended, this version is a pretty big update. I decided to add a **React frontend**, which was... interesting. I'm not a frontend dev at all, so I basically had to learn React on the spot for this. But hey, it works! 

## Tech Stack

**Backend** (Express.js + Node.js)
- Full REST API with routing and business logic
- JWT-based authentication (access + refresh tokens)
- MongoDB Atlas for user accounts

**Frontend** (React + Vite)
- Search interface connected to MangaDex API
- User authentication UI (login/register modals)
- Library management (liked/read sections)
- LocalStorage-based manga library per user

**External APIs**
- MangaDex API for manga search and metadata

## The Database Situation

Users are stored in a central cloud database (MongoDB Atlas) because auth needs to be centralized and secure. But **manga libraries are currently stored locally** (browser localStorage) since I found this to be the most efficient and budget-friendly option without hosting a dedicated database for manga data.

I'm planning to make a **hybrid solution** later down the line 

## Future Ideas (In No Particular Order)

- [ ] Rating system for manga
- [ ] Progress tracking (current chapter)

- [ ] **MyAnimeList API integration** - better statistics and merge user data from other platforms
- [ ] **Reader page** - actually read manga chapters **locally** in the app 
- [ ] Library filters and sorting options
- [ ] User profile customization

### Long Term
- [ ] **Desktop app** - ship everything as an Desktop/mobile app
- [ ] Sync library across devices (would need backend storage then)
- [ ] Recommendations engine
- [ ] Social features? (maybe friends, sharing lists, etc.)

## Known Issues

- No pagination on search results (MangaDex can return a lot)
- UI needs work (darkmode - language selection ...etc)
- localStorage has size limits (~5MB)

## Contributing

This is a personal learning project, but if you have ideas or want to mess around with it, feel free to fork it.

## License

This project is licensed under the MIT License.
---

*Last updated: December 2025*
*Status: ocaisonally tinkering with it*