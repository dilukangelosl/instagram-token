# Use Node.js 22-alpine for a modern, lightweight image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application files (public directory and server.js)
COPY server.js ./
COPY public ./public

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
