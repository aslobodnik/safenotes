# Use Node.js base image
FROM node:18-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with store path configured for Docker
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3000

# Keep container running for development
CMD ["pnpm", "dev"]