# Manual Google Cloud Run Deployment Guide

This guide will help you deploy TrackWithAk to Google Cloud Run without installing the CLI.

## Prerequisites

1. **Google Cloud Account**: You need a Google Cloud account with billing enabled
2. **Docker Desktop**: Install Docker Desktop for Windows
3. **Git**: Ensure Git is installed

## Step 1: Prepare Your Application

Your application is already prepared with:
- ✅ Dockerfile (ready for Cloud Run)
- ✅ package.json (dependencies defined)
- ✅ .env file (bot token configured)
- ✅ index.js (main application)

## Step 2: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "trackwithak-bot")
4. Click "Create"
5. Note your **Project ID** (you'll need this later)

## Step 3: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - Cloud Run API
   - Cloud Build API
   - Container Registry API

## Step 4: Build and Push Docker Image

### Option A: Using Google Cloud Console (Easiest)

1. Go to [Cloud Build](https://console.cloud.google.com/cloud-build)
2. Click "Create Build"
3. Connect your GitHub repository:
   - Click "Connect Repository"
   - Select "GitHub (Cloud Build GitHub App)"
   - Authorize and select your repository
4. Configure the build:
   - **Repository**: Select your trackwithak repository
   - **Branch**: `main`
   - **Build configuration**: `Dockerfile`
   - **Dockerfile location**: `Dockerfile`
   - **Image name**: `gcr.io/YOUR_PROJECT_ID/trackwithak`
5. Click "Create"

### Option B: Using Docker Desktop

1. Open Docker Desktop
2. Open terminal in your project directory
3. Run these commands:

```bash
# Login to Google Cloud (you'll be prompted to authenticate)
docker login gcr.io

# Build the image
docker build -t gcr.io/YOUR_PROJECT_ID/trackwithak .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/trackwithak
```

## Step 5: Deploy to Cloud Run

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click "Create Service"
3. Configure the service:

### Basic Settings:
- **Service name**: `trackwithak`
- **Region**: Choose a region close to you (e.g., `us-central1`)
- **CPU allocation**: `CPU is only allocated during request processing`
- **Memory**: `512 MiB`
- **Request timeout**: `300`

### Container Settings:
- **Container image URL**: `gcr.io/YOUR_PROJECT_ID/trackwithak`
- **Port**: `8080`

### Variables & Secrets:
- **Environment variables**:
  - Name: `bot`
  - Value: `8414418335:AAElwS2mSTqZCyltlLW0vGUPTxL8ONq4zXs`

### Security:
- **Authentication**: `Allow unauthenticated invocations`

4. Click "Create"

## Step 6: Configure Webhook

After deployment, you'll get a URL like: `https://trackwithak-xxxxx-uc.a.run.app`

1. Set up the webhook for your Telegram bot:
```bash
curl -X POST "https://api.telegram.org/bot8414418335:AAElwS2mSTqZCyltlLW0vGUPTxL8ONq4zXs/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://trackwithak-xxxxx-uc.a.run.app/webhook"}'
```

2. Replace `trackwithak-xxxxx-uc.a.run.app` with your actual Cloud Run URL

## Step 7: Test Your Bot

1. Send a message to your Telegram bot
2. The bot should respond with tracking capabilities
3. Check Cloud Run logs for any errors

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all files are committed to your repository
2. **Bot not responding**: Verify webhook URL is correct
3. **Environment variables**: Ensure bot token is set correctly
4. **Port issues**: Cloud Run automatically uses the PORT environment variable

### View Logs:
1. Go to your Cloud Run service
2. Click on "Logs" tab
3. Check for any error messages

## Cost Optimization

- Cloud Run only charges when your service is handling requests
- You can set minimum instances to 0 to save costs
- Consider setting up budget alerts

## Security Notes

- Your bot token is stored as an environment variable
- The service is publicly accessible (required for Telegram webhooks)
- Consider implementing additional security measures for production use

## Next Steps

After successful deployment:
1. Test all bot functionality
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Set up CI/CD for automatic deployments
