# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Create and change to the application directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
# This allows Docker to cache the dependencies layer if they haven't changed
COPY package*.json ./

# Install application dependencies
# For production, consider using `npm ci` for clean installs
RUN npm install --production

# Copy the rest of the application source code
COPY . .

# Expose the port your app will listen on. Cloud Run will inject PORT env var.
# This EXPOSE instruction is informative, Cloud Run uses the PORT env var directly.
EXPOSE 8080

# Run the web service on container startup.
# Cloud Run expects your application to listen on the $PORT environment variable.
CMD [ "node", "index.js" ]
