"""
Agentic Migration Architect - Main Server Runner
Autonomous Data Modernization for Apache Iceberg on Google Cloud
Starts the FastAPI application and modernization cockpit on http://localhost:8000
"""

import os
import sys
import uvicorn

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print(f"[*] Launching Agentic Migration Architect on http://{host}:{port}...")
    print(f"[*] OpenAPI Documentation: http://{host}:{port}/docs")
    uvicorn.run("src.api.main:app", host=host, port=port, reload=False)

