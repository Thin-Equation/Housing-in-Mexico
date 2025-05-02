import pandas as pd
import os
import pickle
from pathlib import Path
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from app.services.data_service import load_housing_data

# Path to model directory
MODEL_DIR = Path(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models"))
os.makedirs(MODEL_DIR, exist_ok=True)

# Model file path
MODEL_PATH = MODEL_DIR / "housing_model.pkl"

def _prepare_feature_matrix(data, features=None):
    """
    Prepare feature matrix X from housing data
    """
    # Default features from the notebook
    if features is None:
        features = ['area', 'rooms', 'bathrooms']
    
    # Filter only numeric features
    numeric_features = [f for f in features if pd.api.types.is_numeric_dtype(data[f])]
    
    # Create feature matrix
    X = data[numeric_features].copy()
    
    # Handle categorical features if needed
    # This would use one-hot encoding for categorical variables
    
    return X

def train_model():
    """
    Train a Ridge regression model for housing price prediction
    """
    # Load the data
    df = load_housing_data()
    
    # Prepare features and target
    X = _prepare_feature_matrix(df)
    y = df['price']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Create a pipeline with preprocessing and model
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', Ridge(alpha=1.0))
    ])
    
    # Train the model
    pipeline.fit(X_train, y_train)
    
    # Save the model
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump({
            'pipeline': pipeline,
            'features': X.columns.tolist(),
            'score': pipeline.score(X_test, y_test)
        }, f)
    
    return pipeline

def load_model():
    """
    Load the trained model from file or train a new one if not available
    """
    if not os.path.exists(MODEL_PATH):
        return train_model()
    
    try:
        with open(MODEL_PATH, 'rb') as f:
            model_data = pickle.load(f)
            return model_data['pipeline']
    except:
        # If loading fails, train a new model
        return train_model()

def get_model_features():
    """
    Get the list of features required for the prediction model
    """
    if not os.path.exists(MODEL_PATH):
        train_model()
    
    with open(MODEL_PATH, 'rb') as f:
        model_data = pickle.load(f)
    
    # Handle potential NaN values in model score
    model_score = model_data['score']
    if pd.isna(model_score):
        model_score = 0.0  # Default value if NaN
    
    return {
        'features': model_data['features'],
        'model_score': float(model_score)  # Ensure it's a valid float
    }

def predict_price(features):
    """
    Predict housing price based on input features
    """
    # Load the model
    pipeline = load_model()
    
    # Get required features
    with open(MODEL_PATH, 'rb') as f:
        model_data = pickle.load(f)
        required_features = model_data['features']
    
    # Extract only the required features from the input
    input_features = {}
    for feature in required_features:
        if feature in features:
            input_features[feature] = features[feature]
        else:
            raise ValueError(f"Missing required feature: {feature}")
    
    # Create a DataFrame from the input features
    input_df = pd.DataFrame([input_features])
    
    # Make prediction
    prediction = pipeline.predict(input_df)[0]
    
    return float(prediction)

def get_feature_importance():
    """
    Get feature importance metrics from the trained model
    """
    # Load the model
    if not os.path.exists(MODEL_PATH):
        train_model()
    
    with open(MODEL_PATH, 'rb') as f:
        model_data = pickle.load(f)
        
    pipeline = model_data['pipeline']
    features = model_data['features']
    
    # Extract coefficients from Ridge model
    coefficients = pipeline.named_steps['model'].coef_
    
    # Create a dictionary of feature importance
    importance = {
        features[i]: float(abs(coefficients[i])) 
        for i in range(len(features))
    }
    
    # Sort by importance
    importance = {k: v for k, v in sorted(
        importance.items(), 
        key=lambda item: item[1], 
        reverse=True
    )}
    
    return importance