# Housing in Mexico and Brazil - Data Analysis & Prediction

This project provides a comprehensive analysis of housing data in Mexico through a full-stack web application featuring a FastAPI backend and Next.js frontend. The application offers interactive data visualization dashboards and a machine learning model for price prediction.

## Project Structure

The project is organized into two main directories:

### Backend (Python + FastAPI)

The backend is built with Python and FastAPI to provide an API for data analysis and prediction functionality.

- `HousingBackend/main.py`: Entry point for the FastAPI application
- `HousingBackend/app/api/routes`: API route handlers (housing_routes.py, model_routes.py)
- `HousingBackend/app/services`: Business logic for data processing (data_service.py) and ML model (model_service.py)
- `HousingBackend/app/database`: Contains housing data CSV files from Mexico and Brazil
- `HousingBackend/app/models`: Contains trained machine learning models (housing_model.pkl)

### Frontend (Next.js + TypeScript)

The frontend is built with Next.js and TypeScript to provide an interactive interface for exploring housing data and making price predictions.

- `HosuingFrontend/src/app`: Next.js app router pages
- `HosuingFrontend/src/components`: React components organized by functionality:
  - `dashboard`: Components for data visualization (AreaStatsChart, PriceStatsChart, PropertyTypeChart, etc.)
  - `map`: Interactive geographic visualization components (LocationMap, MapView)
  - `prediction`: Components for the price prediction feature
- `HosuingFrontend/src/services`: API client services for communicating with the backend
- `HosuingFrontend/src/types`: TypeScript interfaces for type safety

## Setup Instructions

### Backend Setup

1. Make sure you have Python 3.9+ installed
2. Navigate to the backend directory:
   ```
   cd HousingBackend
   ```
3. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
5. Run the FastAPI server:
   ```
   uvicorn main:app --reload
   ```
6. The API will be available at http://localhost:8000
7. FastAPI automatic documentation is available at http://localhost:8000/docs

### Frontend Setup

1. Make sure you have Node.js 18+ installed
2. Navigate to the frontend directory:
   ```
   cd HosuingFrontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env.local` file with the API URL:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```
5. Run the development server:
   ```
   npm run dev
   ```
6. The frontend will be available at http://localhost:3000

## Features

- **Interactive Dashboard**: Visualize housing data through graphs and tables
  - Price distribution analysis
  - Area distribution analysis
  - Property type distribution
  - Regional statistics with the RegionStatsTable component

- **Interactive Map**: Explore property locations geographically
  - Visual representation of properties across regions
  - Location-based filtering and analysis

- **Country/Region Selection**: Support for multiple regions including Mexico and Brazil
  - Data comparison across different regions
  - Customized analysis by country

- **Machine Learning Price Prediction**: Predict housing prices based on features
  - Input property characteristics through the PredictionForm component
  - Get instant price estimates based on the trained model

## Data Sources

The application uses multiple real estate datasets:
- Mexico City real estate (5 datasets)
- Brazil real estate (2 datasets)

All datasets are stored in the `HousingBackend/app/database` directory.

## Technology Stack

### Backend
- FastAPI for high-performance API development
- Pandas for data manipulation and analysis
- Scikit-learn for machine learning models
- Pickle for model serialization

### Frontend
- Next.js for React framework with server-side rendering
- TypeScript for type safety
- Chart.js for data visualization
- React components for modular UI development

## Development

- Backend API endpoints can be explored and tested using the FastAPI documentation at http://localhost:8000/docs
- The frontend uses React components with TypeScript for type safety
- ESLint is configured for code quality (eslint.config.mjs)

## Deployment

For production deployment:

1. Set up proper environment variables for both frontend and backend
2. Use a production WSGI server like Gunicorn for the FastAPI backend
3. Build the Next.js frontend with `npm run build`
4. Deploy behind a reverse proxy like Nginx or using a cloud hosting service like Vercel for the frontend and a cloud provider for the backend

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
