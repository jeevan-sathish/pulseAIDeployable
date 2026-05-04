from fastapi import FastAPI
import pandas as pd
import joblib
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from groq import Groq
from fastapi.middleware.cors import CORSMiddleware

# ================= INIT =================
load_dotenv()

app = FastAPI()

# ✅ CORS (VERY IMPORTANT for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= LOAD MODEL =================
model = joblib.load("./models/model.pkl")
scaler = joblib.load("./models/scaler.pkl")
columns = joblib.load("./models/columns.pkl")

# ================= INPUT SCHEMA =================
class InputData(BaseModel):
    Age: int
    Sex: str
    ChestPainType: str
    RestingBP: int
    Cholesterol: int
    FastingBS: int
    RestingECG: str
    MaxHR: int
    ExerciseAngina: str
    Oldpeak: float
    ST_Slope: str

# ================= ROUTES =================
@app.get("/")
def home():
    return {"message": "API is running 🚀"}

@app.post("/predict")
def predict(data: InputData):

    # ================= GROQ AI =================
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"Give short health suggestions for: {data.dict()}"
            }
        ]
    )

    suggestions = response.choices[0].message.content

    # ================= ML PROCESS =================
    df = pd.DataFrame([data.dict()])
    df = pd.get_dummies(df)
    df = df.reindex(columns=columns, fill_value=0)
    df = scaler.transform(df)

    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0][1]

    # ================= RESPONSE =================
    return {
        "prediction": int(prediction),
        "probability": float(probability),
        "suggestions": suggestions
    }