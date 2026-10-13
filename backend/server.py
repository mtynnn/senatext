import json
from pathlib import Path
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pickle

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model"
# Ahora usaremos un modelo de scikit-learn mucho más ligero
MODEL_PATH = MODEL_DIR / "senatext_landmarks.pkl"
LABELS_PATH = MODEL_DIR / "labels.json"

# Intentar cargar las etiquetas existentes
try:
    labels = json.loads(LABELS_PATH.read_text(encoding="utf-8"))
except:
    labels = ["hola", "gracias", "por favor", "ayuda"]

# Intentar cargar el modelo (si ya fue entrenado)
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("✅ Modelo de Landmarks cargado correctamente.")
except:
    model = None
    print("⚠️ No se encontró senatext_landmarks.pkl. Funcionando en modo de prueba (Mock).")

# El nuevo esquema de datos: Recibe las coordenadas (Landmarks) en lugar de imágenes
class PredictRequest(BaseModel):
    # Lista de coordenadas X, Y, Z planas
    landmarks: List[float]

app = FastAPI(title="SeñaText API (Landmarks)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(request: PredictRequest):
    if not request.landmarks:
        raise HTTPException(status_code=400, detail="No landmarks provided")

    if model:
        # Predecir usando el modelo real de scikit-learn
        features = np.array(request.landmarks).reshape(1, -1)
        probs = model.predict_proba(features)[0]
        order = np.argsort(probs)[::-1][:3]
        top = [{"label": labels[int(i)], "confidence": float(probs[int(i)])} for i in order]
    else:
        # Modo de prueba: devolver algo aleatorio o fijo para que el frontend no se rompa
        top = [
            {"label": "hola (modo prueba)", "confidence": 0.99},
            {"label": "gracias", "confidence": 0.01},
            {"label": "ayuda", "confidence": 0.0}
        ]

    return {
        "label": top[0]["label"],
        "confidence": top[0]["confidence"],
        "top": top
    }
