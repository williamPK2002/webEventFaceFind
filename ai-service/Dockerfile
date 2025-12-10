FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and InsightFace
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Download InsightFace models during build to avoid runtime download
# We run a tiny script to trigger the download
RUN python -c "from insightface.app import FaceAnalysis; FaceAnalysis(name='buffalo_l').prepare(ctx_id=0)"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
