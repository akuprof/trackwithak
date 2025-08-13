#!/bin/bash

# TrackWithAk Deployment Script
# This script provides multiple deployment options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        print_status "Creating .env file from .env.BOT_TOKEN..."
        if [ -f ".env.BOT_TOKEN" ]; then
            cp .env.BOT_TOKEN .env
            print_status ".env file created successfully"
        else
            print_error "No bot token file found. Please create a .env file with your bot token:"
            echo "bot=YOUR_TELEGRAM_BOT_TOKEN_HERE"
            exit 1
        fi
    fi
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm install
    print_status "Dependencies installed successfully"
}

# Local deployment
deploy_local() {
    print_status "Starting local deployment..."
    check_env
    install_deps
    print_status "Starting application on http://localhost:8080"
    npm start
}

# Docker deployment
deploy_docker() {
    print_status "Starting Docker deployment..."
    check_env
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    print_status "Building Docker image..."
    docker build -t trackwithak .
    
    print_status "Running Docker container..."
    docker run -d --name trackwithak-app -p 8080:8080 --env-file .env trackwithak
    
    print_status "Application deployed successfully!"
    print_status "Access the application at http://localhost:8080"
    print_status "To view logs: docker logs trackwithak-app"
    print_status "To stop: docker stop trackwithak-app"
}

# Docker Compose deployment
deploy_docker_compose() {
    print_status "Starting Docker Compose deployment..."
    check_env
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Starting services with Docker Compose..."
    docker-compose up -d
    
    print_status "Application deployed successfully!"
    print_status "Access the application at http://localhost:8080"
    print_status "To view logs: docker-compose logs -f"
    print_status "To stop: docker-compose down"
}

# Google Cloud Run deployment
deploy_cloud_run() {
    print_status "Starting Google Cloud Run deployment..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud CLI is not installed. Please install gcloud first."
        exit 1
    fi
    
    # Get project ID
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        print_error "No Google Cloud project set. Please run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    # Get bot token from .env
    BOT_TOKEN=$(grep "^bot=" .env | cut -d'=' -f2)
    if [ -z "$BOT_TOKEN" ]; then
        print_error "Bot token not found in .env file"
        exit 1
    fi
    
    print_status "Building and pushing to Google Container Registry..."
    gcloud builds submit --tag gcr.io/$PROJECT_ID/trackwithak
    
    print_status "Deploying to Cloud Run..."
    gcloud run deploy trackwithak \
        --image gcr.io/$PROJECT_ID/trackwithak \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --set-env-vars "bot=$BOT_TOKEN"
    
    print_status "Application deployed to Cloud Run successfully!"
}

# Railway deployment
deploy_railway() {
    print_status "Starting Railway deployment..."
    
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed. Please install Railway CLI first."
        exit 1
    fi
    
    check_env
    install_deps
    
    print_status "Deploying to Railway..."
    railway up
    
    print_status "Application deployed to Railway successfully!"
}

# Heroku deployment
deploy_heroku() {
    print_status "Starting Heroku deployment..."
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Please install Heroku CLI first."
        exit 1
    fi
    
    # Get bot token from .env
    BOT_TOKEN=$(grep "^bot=" .env | cut -d'=' -f2)
    if [ -z "$BOT_TOKEN" ]; then
        print_error "Bot token not found in .env file"
        exit 1
    fi
    
    print_status "Setting Heroku environment variables..."
    heroku config:set bot=$BOT_TOKEN
    
    print_status "Deploying to Heroku..."
    git push heroku main
    
    print_status "Application deployed to Heroku successfully!"
}

# Show usage
show_usage() {
    echo "TrackWithAk Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  local              Deploy locally with npm"
    echo "  docker             Deploy with Docker"
    echo "  compose            Deploy with Docker Compose"
    echo "  cloud-run          Deploy to Google Cloud Run"
    echo "  railway            Deploy to Railway"
    echo "  heroku             Deploy to Heroku"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local"
    echo "  $0 docker"
    echo "  $0 cloud-run"
}

# Main script
case "${1:-}" in
    "local")
        deploy_local
        ;;
    "docker")
        deploy_docker
        ;;
    "compose")
        deploy_docker_compose
        ;;
    "cloud-run")
        deploy_cloud_run
        ;;
    "railway")
        deploy_railway
        ;;
    "heroku")
        deploy_heroku
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        print_error "Invalid option. Use '$0 help' for usage information."
        exit 1
        ;;
esac
