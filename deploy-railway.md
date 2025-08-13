# Quick Railway Deployment Guide

Railway is often the fastest way to deploy Node.js applications. Here's how to deploy TrackWithAk:

## Prerequisites
- GitHub account
- Railway account (free at [railway.app](https://railway.app))

## Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trackwithak.git
git push -u origin main
```

## Step 2: Deploy on Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your trackwithak repository
4. Railway will automatically detect it's a Node.js app

## Step 3: Configure Environment Variables
1. In your Railway project, go to "Variables" tab
2. Add environment variable:
   - **Name**: `bot`
   - **Value**: `8414418335:AAElwS2mSTqZCyltlLW0vGUPTxL8ONq4zXs`

## Step 4: Deploy
1. Railway will automatically build and deploy
2. You'll get a URL like: `https://trackwithak-production.up.railway.app`

## Step 5: Configure Webhook
```bash
curl -X POST "https://api.telegram.org/bot8414418335:AAElwS2mSTqZCyltlLW0vGUPTxL8ONq4zXs/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://trackwithak-production.up.railway.app/webhook"}'
```

## Benefits of Railway
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ Automatic deployments from GitHub
- ✅ Built-in logging and monitoring

## Cost
- Free tier: $5 credit monthly
- Pay-as-you-go after that
- Very cost-effective for small applications
