# SquadChoice 🎮🎲

SquadChoice is a fast, lightweight, and session-based voting web application designed specifically for LAN parties and gaming groups. It solves the classic "What should we play next?" dilemma by allowing anyone to spin up a quick voting session, share a link, add games (via IGDB integration), and vote effortlessly.

## ✨ Features
- **One-Click Sessions**: No registration or email required. Press "Create" and share the 8-character ID link.
- **Thick Client Architecture**: State is primarily managed on the client, with rapid syncing to the backend.
- **IGDB API Integration**: Search for any game instantly and pull high-quality cover art automatically.
- **Real-Time Feel**: Polling ensures everyone sees the votes update across devices almost instantly.
- **Tie-Breaker Spin Wheel**: If two games have the same amount of votes, an integrated casino-style wheel decides the final winner.
- **Played Tracking**: Move games to a "Played" area once the match is over to keep the active pool clean.
- **Customization**: Every user gets to pick their own color/avatar.

## 🛠️ Tech Stack
- **Frontend**: React (Vite)
- **Backend / API**: Serverless Functions (Vercel API routes) / Express (for local dev)
- **Database**: LibSQL / Turso Cloud Database
- **Styling**: Custom CSS & Flexbox/Grid
- **Hosting**: Designed for Vercel Hobby Tier

## 🚀 Running Locally

To run SquadChoice on your own machine, you need [Node.js](https://nodejs.org/) installed.

1. **Clone the repository**
   ```bash
   git clone https://github.com/xhizorsz/squad-choice.git
   cd squad-choice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory. You will need API keys from Twitch (for IGDB) and Turso (if using the cloud DB).
   ```env
   # .env
   TWITCH_CLIENT_ID=your_twitch_client_id
   TWITCH_CLIENT_SECRET=your_twitch_client_secret
   # Optional: If not set, the app will fall back to a local SQLite file (local.db) in development.
   TURSO_DB_URL=your_turso_url
   TURSO_AUTH_TOKEN=your_turso_token
   # Optional: For triggering database cleanup tasks
   CRON_SECRET=your_secret_password
   ```

4. **Start the Local Development Backend**
   SquadChoice uses a custom Express server for local development to simulate Vercel's serverless environment.
   Open a terminal and run:
   ```bash
   # Windows PowerShell
   $env:NODE_ENV="development"; node local-server.js
   
   # Linux/Mac
   NODE_ENV=development node local-server.js
   ```

5. **Start the Vite Frontend**
   Leave the backend running and open a **second terminal** window:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

---
Built with ❤️ for gamers.
