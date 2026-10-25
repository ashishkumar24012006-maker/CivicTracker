# CivicTrack — Production Hosting & Deployment Guide

This guide explains how your CivicTrack full-stack application is hosted, including your **instant live public link** (active right now) and instructions for **permanent 24/7 cloud deployment** on free hosting platforms like Render, Railway, or Vercel.

---

## 🌐 1. Instant Live Access (Active Right Now)

Your website is currently broadcast live on the internet via secure HTTPS tunnel:

- **Live Public URL:** **[https://tired-zoos-heal.loca.lt](https://tired-zoos-heal.loca.lt)**
- **Tunnel IP/Password (if prompted on first open):** `27.61.42.234`

Anyone can open this link from their mobile phone, tablet, or another computer anywhere in the world to test the platform.

### Quick Demo Logins to Try on Live Link:
- 👤 **Citizen:** `citizen@civictrack.org` | `password123`
- 🛡️ **Administrator:** `admin@civictrack.org` | `password123`
- 👷 **Staff:** `staff.roads@civictrack.org` | `password123`

---

## ☁️ 2. Permanent 24/7 Cloud Hosting (Recommended: Render.com)

Render provides free hosting for full-stack Node.js applications. A `render.yaml` blueprint is already pre-configured in your project.

### Step 1: Create a Free MongoDB Database (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Create a Deployment** and select the **M0 Free** cluster.
3. Under **Database Access**, create a user (e.g., `admin` / `YourSecurePassword123`).
4. Under **Network Access**, click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers** (Node.js) -> Copy your connection string:
   ```
   mongodb+srv://admin:YourSecurePassword123@cluster0.abcde.mongodb.net/civictrack?retryWrites=true&w=majority
   ```

### Step 2: Push Your Project to GitHub
1. Create a new repository on [github.com](https://github.com) named `CivicTrack`.
2. Push your project code:
   ```bash
   git init
   git add .
   git commit -m "Deploy CivicTrack"
   git branch -M main
   git remote add origin https://github.com/<your-username>/CivicTrack.git
   git push -u origin main
   ```

### Step 3: Deploy to Render
1. Sign up / log in to [render.com](https://render.com).
2. Click **New +** -> **Web Service** (or **Blueprint**).
3. Connect your `CivicTrack` GitHub repository.
4. Set the following configuration settings:
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     npm install && npm --prefix server install && npm --prefix client install && npm --prefix client run build
     ```
   - **Start Command:**
     ```bash
     node server/server.js
     ```
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<your MongoDB Atlas connection string from Step 1>`
   - `JWT_SECRET`: `civictrack_super_secure_jwt_secret_key_2026_modern`
   - `JWT_EXPIRE`: `30d`
6. Click **Create Web Service**.

Render will automatically build the React frontend bundle, launch the Node.js backend, connect to your database, auto-seed the demo accounts, and provide you with a permanent HTTPS domain (e.g. `https://civictrack.onrender.com`).

---

## 🚂 3. Alternative: Deploy to Railway.app

1. Go to [railway.app](https://railway.app) and log in with GitHub.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your `CivicTrack` repository.
4. Click **Variables** and add:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `<your MongoDB Atlas URI>`
   - `JWT_SECRET` = `civictrack_super_secure_jwt_secret_key_2026_modern`
5. Click **Settings** -> **Generate Domain** to get your public live URL.

---

## ⚡ 4. Alternative: Vercel (Frontend) + Render (Backend)

If you prefer to host the frontend separately on Vercel:
1. Deploy `server/` to Render or Railway as an API service.
2. Deploy `client/` to Vercel and set `VITE_API_URL` to point to your live backend domain.
