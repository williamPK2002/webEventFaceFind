import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
import io
from PIL import Image
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="Face Search AI Service")

# Initialize Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Initialize InsightFace
# 'buffalo_l' is a good balance of speed and accuracy
model = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
model.prepare(ctx_id=0, det_size=(640, 640))

class FaceEmbedding(BaseModel):
    embedding: List[float]
    bbox: List[int]
    det_score: float

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Face Search AI"}

@app.post("/extract", response_model=List[FaceEmbedding])
async def extract_faces(file: UploadFile = File(...)):
    try:
        # Read image file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            # Return empty array instead of error - image can't be decoded
            return []

        # Detect faces
        faces = model.get(img)
        
        results = []
        for face in faces:
            results.append({
                "embedding": face.embedding.tolist(),
                "bbox": face.bbox.astype(int).tolist(),
                "det_score": float(face.det_score)
            })
            
        return results

    except Exception as e:
        # Log the error but return empty array
        print(f"Error processing image: {str(e)}")
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
