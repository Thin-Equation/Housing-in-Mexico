from fastapi import APIRouter, HTTPException, Query
import json
from typing import Optional

from app.services.data_service import (
    load_housing_data, 
    get_price_statistics,
    get_area_statistics,
    get_location_data,
    get_property_types,
    get_region_statistics,
    get_countries
)

router = APIRouter()

@router.get("/data")
async def get_housing_data(limit: int = 100, offset: int = 0, country: Optional[str] = None):
    """
    Get paginated housing data
    
    - **limit**: Number of records to return
    - **offset**: Number of records to skip
    - **country**: Optional filter by country (mexico or brazil)
    """
    try:
        data = load_housing_data(country)
        total = len(data)
        
        # Apply pagination
        paginated_data = data.iloc[offset:offset+limit]
        
        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "data": json.loads(paginated_data.to_json(orient="records"))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/price-stats")
async def get_price_stats(country: Optional[str] = None):
    """
    Get statistics about housing prices
    
    - **country**: Optional filter by country (mexico or brazil)
    """
    try:
        stats = get_price_statistics(country)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/area-stats")
async def get_area_stats(country: Optional[str] = None):
    """
    Get statistics about property areas
    
    - **country**: Optional filter by country (mexico or brazil)
    """
    try:
        stats = get_area_statistics(country)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/locations")
async def get_locations(country: Optional[str] = None):
    """
    Get housing location data suitable for map visualization
    
    - **country**: Optional filter by country (mexico or brazil)
    """
    try:
        locations = get_location_data(country)
        return locations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/property-types")
async def get_properties(country: Optional[str] = None):
    """
    Get property type distribution
    
    - **country**: Optional filter by country (mexico or brazil)
    """
    try:
        property_types = get_property_types(country)
        return property_types
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/region-stats")
async def get_regions(country: Optional[str] = None):
    """
    Get statistics grouped by region
    
    - **country**: Optional filter by country (mexico or brazil)
    """
    try:
        region_stats = get_region_statistics(country)
        return region_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/countries")
async def get_available_countries():
    """
    Get list of available countries in the dataset
    """
    try:
        countries = get_countries()
        return {"countries": countries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))