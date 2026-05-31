FROM node:20-slim

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy all source files
COPY . .

# Expose API runtime port
EXPOSE 3001

# Execute server startup command
CMD ["node", "server.js"]
