from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np

app = FastAPI()

# 1. LOAD THE TRAINED BRAIN
with open('spam_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

class Message(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "AI Spam Classification Service is running"}

@app.post("/classify")
def classify_message(msg: Message):
    # Vectorize the text input
    X = vectorizer.transform([msg.text])
    
    # Predict (1 for SPAM, 0 for HAM/SAFE)
    prediction = model.predict(X)[0]
    
    # Get probability score
    prob = model.predict_proba(X)[0]
    confidence = round(float(np.max(prob)) * 100, 2)
    
    result = "Spam" if prediction == 1 else "Safe"
    
    return {
        "prediction": result,
        "confidence": confidence,
        "raw_label": int(prediction)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
