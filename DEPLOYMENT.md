# TrackWithAk Deployment Guide

This guide provides multiple deployment options for the TrackWithAk Telegram bot application.

## Prerequisites

1. **Telegram Bot Token**: Create a bot through [BotFather](https://t.me/BotFather) and get your API token
2. **Node.js**: Version 16 or higher
3. **npm**: For package management

## Environment Setup

1. Create a `.env` file in the root directory:
```bash
bot=YOUR_TELEGRAM_BOT_TOKEN_HERE
```

2. Install dependencies:
```bash
npm install
```

## Deployment Options

### 1. Local Deployment

**Start the application locally:**
```bash
npm start
```

The application will run on `http://localhost:8080`

### 2. Docker Deployment

**Build the Docker image:**
```bash
docker build -t trackwithak .
```

**Run the container:**
```bash
docker run -p 8080:8080 --env-file .env trackwithak
```

### 3. Google Cloud Run Deployment

**Prerequisites:**
- Google Cloud CLI installed
- Docker installed
- Google Cloud project set up

**Deploy to Cloud Run:**
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/trackwithak

# Deploy to Cloud Run
gcloud run deploy trackwithak \
  --image gcr.io/YOUR_PROJECT_ID/trackwithak \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "bot=YOUR_TELEGRAM_BOT_TOKEN"
```

### 4. Railway Deployment

**Prerequisites:**
- Railway CLI installed
- Railway account

**Deploy to Railway:**
```bash
# Login to Railway
railway login

# Initialize Railway project
railway init

# Set environment variables
railway variables set bot=YOUR_TELEGRAM_BOT_TOKEN

# Deploy
railway up
```

### 5. Heroku Deployment

**Prerequisites:**
- Heroku CLI installed
- Heroku account

**Deploy to Heroku:**
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set bot=YOUR_TELEGRAM_BOT_TOKEN

# Deploy
git push heroku main
```

### 6. Replit Deployment

The project is already configured for Replit deployment:

1. Fork the repository to your GitHub account
2. Go to [Replit](https://replit.com)
3. Click "Create Repl" and select "Import from GitHub"
4. Select your forked repository
5. Add your bot token as a secret with key `bot`
6. Click "Run"

## Configuration

### Environment Variables

- `bot`: Your Telegram bot token (required)
- `PORT`: Port number (default: 8080)
- `K_SERVICE_URL`: Cloud Run service URL (auto-set by Cloud Run)

### Webhook Configuration

After deployment, you need to set up the webhook for your Telegram bot:

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "YOUR_DEPLOYED_URL/webhook"}'
```

Replace:
- `YOUR_BOT_TOKEN` with your actual bot token
- `YOUR_DEPLOYED_URL` with your deployed application URL

## Testing

1. Start the application
2. Send a message to your Telegram bot
3. The bot should respond with tracking capabilities

## Troubleshooting

### Common Issues

1. **Bot not responding**: Check if the webhook is properly configured
2. **Port already in use**: Change the PORT environment variable
3. **Environment variables not loaded**: Ensure `.env` file is in the root directory

### Logs

Check application logs for debugging:
```bash
# Local
npm start

# Docker
docker logs container_name

# Cloud Run
gcloud logs read --service=trackwithak
```

## Security Notes

- Keep your bot token secure and never commit it to version control
- Use environment variables for sensitive configuration
- Consider using HTTPS for production deployments
- Review the application's tracking capabilities and ensure compliance with privacy laws

## Disclaimer

This tool is for educational purposes only. Users are responsible for compliance with applicable laws and regulations regarding privacy and data protection.
