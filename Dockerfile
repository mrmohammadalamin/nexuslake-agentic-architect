# NexusLake Agentic Architect — Google Cloud Run Production Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy platform source code
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY tests/ ./tests/
COPY README.md .
COPY REAL_DATA_MIGRATION_GUIDE.md .
COPY run_server.py .

# Copy pre-built frontend SPA dist files
COPY frontend/dist/ ./frontend/dist/

# Expose Cloud Run port
EXPOSE 8000

ENV PORT=8000
ENV HOST=0.0.0.0

CMD ["python", "run_server.py"]
