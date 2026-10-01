# Base image with Node.js on Debian Bookworm
FROM node:22-bookworm-slim

# Install Python 3, pip, virtual environment, and OpenCV system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set up Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python requirements for YOLO inference
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install npm dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV PYTHON_BIN="/opt/venv/bin/python"

EXPOSE 3000

# Start server
CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]
