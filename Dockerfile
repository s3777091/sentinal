# Use node:20-slim as the base image
FROM node:20-slim AS base

# Create builder stage
FROM base AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy rest of the application and build it
COPY . .

# Disable telemetry and set production environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Define build arguments (ensure they're passed during the build process)
ARG DIRECT_DATABASE_URL
ARG HUGGINGFACE_API_KEY
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
ARG KAFKA_USER
ARG KAFKA_PASSWORD
ARG BASE_ADMIN_MODEL
ARG SENTRY_AUTH_TOKEN
ARG UPLOADTHING_SECRET
ARG UPLOADTHING_APP_ID
ARG WEBHOOK_SECRET

# Run Next.js build
RUN npm run build

# Create the runner stage to run the application
FROM base AS runner

WORKDIR /app

# Disable telemetry and set environment to production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Create a system user for better security practices
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder and the Next.js build output from the builder
COPY --from=builder /app/public ./public

# Ensure that the .next folder is owned by the nextjs user
RUN mkdir .next && chown nextjs:nodejs .next

# Copy the Next.js standalone build and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the nextjs user
USER nextjs

# Expose port 3000 and set the environment variable for the port
EXPOSE 3000
ENV PORT=3000

# Use the default next start command to start the Next.js application
CMD ["node", "server.js"]