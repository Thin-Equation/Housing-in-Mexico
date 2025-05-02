from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pydantic import BaseModel

from app.services.model_service import (
    predict_price,
    get_model_features,
    get_feature_importance
)

router = APIRouter()

class PredictionRequest(BaseModel):
    """Model for housing price prediction request"""
    features: Dict[str, Any]

@router.post("/predict")
async def predict_housing_price(request: PredictionRequest):
    """
    Predict housing price based on input features
    """
    try:
        prediction = predict_price(request.features)
        return {
            "predicted_price": prediction,
            "input_features": request.features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/features")
async def get_features():
    """
    Get the list of features required for the prediction model
    """
    try:
        features = get_model_features()
        return features
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/importance")
async def get_importance():
    """
    Get feature importance metrics from the trained model
    """
    try:
        importance = get_feature_importance()
        return importance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))