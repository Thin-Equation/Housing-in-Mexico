from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import our API routers
from app.api.routes import housing_routes, model_routes

# Create FastAPI app
app = FastAPI(
    title="Housing in Mexico API",
    description="API for analyzing and predicting housing prices in Mexico",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(housing_routes.router, prefix="/api/housing", tags=["Housing Data"])
app.include_router(model_routes.router, prefix="/api/model", tags=["Prediction Model"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to the Housing in Mexico API",
        "documentation": "/docs",
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)