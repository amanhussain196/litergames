# Deployment Guide

This guide describes how to deploy the LiterGames platform to the internet.

## 1. Backend Deployment (Render.com)

We recommend **Render** for the backend because it supports websockets and Node.js easily.

1.  Push your code to **GitHub**.
2.  Go to [Render Dashboard](https://dashboard.render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Root Directory**: `server`
6.  **Build Command**: `npm install && npm run build`
7.  **Start Command**: `npm start`
8.  **Environment Variables**:
    *   `NODE_ENV`: `production`
    *   `MONGO_URI`: (Your MongoDB Connection String - e.g. from MongoDB Atlas)
    *   `PORT`: `5000` (Render will override this, but good to have)
9.  Click **Create Web Service**.
10. Copy the **Service URL** (e.g., `https://litergames-server.onrender.com`).

## 2. Frontend Deployment (Vercel)

We recommend **Vercel** for the frontend.

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Root Directory**: Select `client` (click "Edit" next to Root Directory).
5.  **Build Command**: `npm run build` (Default)
6.  **Output Directory**: `dist` (Default)
7.  **Environment Variables**:
    *   `VITE_API_URL`: Paste your Backend URL here (e.g., `https://litergames-server.onrender.com`).
8.  Click **Deploy**.

## 3. Post-Deployment Checks

1.  Open your Vercel URL.
2.  Check if the socket connects (look at console logs).
3.  Try creating a room.

## MongoDB Setup (If you haven't already)

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a free cluster.
3.  Create a database user.
4.  Get the connection string (Driver: Node.js).
5.  Use this string for the `MONGO_URI` in Render.
