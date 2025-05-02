import pandas as pd
import numpy as np
import os
import glob
from pathlib import Path

# Update path to database directory where CSV files are now located
DATABASE_DIR = Path(os.path.join(os.path.dirname(os.path.dirname(__file__)), "database"))
print(f"Database directory path: {DATABASE_DIR}")

def load_housing_data(country=None):
    """
    Load housing data from multiple CSV files
    
    Args:
        country: Optional filter by country ('mexico' or 'brazil'). If None, returns all data.
    """
    all_dataframes = []
    
    # Get all CSV files from the database directory
    csv_pattern = "brazil-*.csv" if country == "brazil" else "mexico-*.csv" if country == "mexico" else "*.csv"
    csv_files = glob.glob(str(DATABASE_DIR / csv_pattern))
    print(f"Found {len(csv_files)} CSV files for pattern: {csv_pattern}")
    for file in csv_files:
        print(f"Found file: {file}")
    
    if not csv_files:
        print("No CSV files found - using sample data")
        # Return sample data if no files found
        return pd.DataFrame({
            'price': [2000000, 3500000, 1800000, 4500000, 3200000],
            'area': [150, 220, 120, 300, 180],
            'rooms': [3, 4, 2, 5, 3],
            'bathrooms': [2, 3, 1, 3, 2],
            'property_type': ['house', 'apartment', 'house', 'house', 'apartment'],
            'region': ['Mexico City', 'Guadalajara', 'Mexico City', 'Monterrey', 'Mexico City'],
            'latitude': [19.4326, 20.6597, 19.3371, 25.6866, 19.4978],
            'longitude': [-99.1332, -103.3496, -99.1826, -100.3161, -99.1269],
            'country': ['Mexico', 'Mexico', 'Mexico', 'Mexico', 'Mexico']
        })
    
    # Load and combine all csv files
    for csv_file in csv_files:
        try:
            print(f"Loading file: {csv_file}")
            df = pd.read_csv(csv_file)
            print(f"  - Loaded {len(df)} rows")
            print(f"  - Columns: {df.columns.tolist()}")
            
            # Standardize column names first (assuming columns might have different casing or naming conventions)
            df.columns = [col.lower().strip() for col in df.columns]
            
            # Check for required columns
            if 'price' not in df.columns:
                print(f"  - Warning: 'price' column missing in {csv_file}")
                # Look for possible price column alternatives
                price_alternatives = [col for col in df.columns if 'price' in col.lower() or 'cost' in col.lower() or 'value' in col.lower()]
                if price_alternatives:
                    print(f"  - Found alternative price column: {price_alternatives[0]}")
                    df['price'] = df[price_alternatives[0]]
                else:
                    print(f"  - No price column found in {csv_file}")
                    
            if 'area' not in df.columns:
                print(f"  - Warning: 'area' column missing in {csv_file}")
                # Look for possible area column alternatives with more specific checks for Mexico data
                area_alternatives = [
                    col for col in df.columns 
                    if 'area' in col.lower() or 
                       'size' in col.lower() or 
                       'surface' in col.lower() or 
                       'sqft' in col.lower() or 
                       'm2' in col.lower()
                ]
                if 'surface_total_in_m2' in df.columns:
                    print(f"  - Using surface_total_in_m2 as area")
                    df['area'] = df['surface_total_in_m2']
                elif 'surface_covered_in_m2' in df.columns:
                    print(f"  - Using surface_covered_in_m2 as area")
                    df['area'] = df['surface_covered_in_m2']
                elif area_alternatives:
                    print(f"  - Found alternative area column: {area_alternatives[0]}")
                    df['area'] = df[area_alternatives[0]]
                else:
                    print(f"  - No area column found in {csv_file}")
            
            # Extract latitude and longitude from lat-lon column if present
            if 'lat-lon' in df.columns and 'latitude' not in df.columns:
                print(f"  - Extracting latitude and longitude from lat-lon column")
                try:
                    # Extract coordinates from format like "19.4326,-99.1332"
                    coords = df['lat-lon'].str.extract(r'([-\d.]+),([-\d.]+)')
                    if not coords.empty and coords.shape[1] == 2:
                        df['latitude'] = pd.to_numeric(coords[0], errors='coerce')
                        df['longitude'] = pd.to_numeric(coords[1], errors='coerce')
                        print(f"  - Successfully extracted coordinates for {df['latitude'].notna().sum()} rows")
                    else:
                        print(f"  - Failed to extract coordinates from lat-lon column")
                except Exception as e:
                    print(f"  - Error extracting coordinates: {e}")
            
            # Extract region from place_with_parent_names if present
            if 'place_with_parent_names' in df.columns and 'region' not in df.columns:
                print(f"  - Extracting region from place_with_parent_names column")
                try:
                    # Format is typically "|City|State|Country|"
                    df['region'] = df['place_with_parent_names'].str.split('|').apply(
                        lambda x: next((part for part in x if part), 'Unknown') if isinstance(x, list) else 'Unknown'
                    )
                    print(f"  - Extracted regions: {df['region'].value_counts().to_dict()}")
                except Exception as e:
                    print(f"  - Error extracting region: {e}")
                    
            # Add source file name as a column
            filename = os.path.basename(csv_file)
            
            # Add country field based on filename
            if 'brazil' in filename.lower():
                df['country'] = 'Brazil'
            elif 'mexico' in filename.lower():
                df['country'] = 'Mexico'
            else:
                df['country'] = 'Unknown'
            
            # Make sure required columns exist, use dummy values if missing
            for required_col in ['price', 'area', 'rooms', 'bathrooms']:
                if required_col not in df.columns:
                    df[required_col] = np.nan
            
            if 'property_type' not in df.columns and 'type' in df.columns:
                df['property_type'] = df['type']
            elif 'property_type' not in df.columns:
                df['property_type'] = 'unknown'
                
            if 'region' not in df.columns and 'state' in df.columns:
                df['region'] = df['state']
            elif 'region' not in df.columns and 'city' in df.columns:
                df['region'] = df['city']
            elif 'region' not in df.columns:
                if 'brazil' in filename.lower():
                    df['region'] = 'Brazil'
                else:
                    df['region'] = 'Mexico City'
            
            # Filter out rows where price or area is negative or zero
            original_len = len(df)
            df = df[(df['price'] > 0) | pd.isna(df['price'])]
            df = df[(df['area'] > 0) | pd.isna(df['area'])]
            filtered_len = len(df)
            if original_len != filtered_len:
                print(f"  - Filtered out {original_len - filtered_len} rows with invalid price or area")
            
            print(f"  - Final data shape: {df.shape}")
            all_dataframes.append(df)
        except Exception as e:
            print(f"Error loading file {csv_file}: {e}")
            continue
    
    # Combine all dataframes
    if not all_dataframes:
        print("No dataframes were created successfully")
        return pd.DataFrame()  # Return empty df if no files were loaded successfully
    
    combined_df = pd.concat(all_dataframes, ignore_index=True)
    
    # Basic data cleaning
    original_len = len(combined_df)
    combined_df = combined_df.dropna(subset=['price', 'area'])  # Drop rows with NaN in critical columns
    filtered_len = len(combined_df)
    print(f"Dropped {original_len - filtered_len} rows with missing price or area")
    
    # Remove extreme outliers (e.g., prices that are too high or too low)
    if len(combined_df) > 100:  # Only apply filtering if we have enough data
        q_low = combined_df['price'].quantile(0.01)
        q_high = combined_df['price'].quantile(0.99)
        original_len = len(combined_df)
        combined_df = combined_df[(combined_df['price'] > q_low) & (combined_df['price'] < q_high)]
        filtered_len = len(combined_df)
        print(f"Removed {original_len - filtered_len} price outliers")
        
        q_low = combined_df['area'].quantile(0.01)
        q_high = combined_df['area'].quantile(0.99)
        original_len = len(combined_df)
        combined_df = combined_df[(combined_df['area'] > q_low) & (combined_df['area'] < q_high)]
        filtered_len = len(combined_df)
        print(f"Removed {original_len - filtered_len} area outliers")
    
    print(f"Final dataset has {len(combined_df)} rows with columns: {combined_df.columns.tolist()}")
    
    # Print sample data to verify values are correct
    print("\nSample data:")
    print(combined_df[['price', 'area', 'property_type', 'country']].head())
    
    return combined_df

def get_price_statistics(country=None):
    """
    Calculate statistics about housing prices
    
    Args:
        country: Optional filter by country ('mexico' or 'brazil')
    """
    df = load_housing_data(country)
    
    # Check if dataframe has data
    if df.empty:
        return {
            "mean": 0.0,
            "median": 0.0,
            "min": 0.0,
            "max": 0.0,
            "std": 0.0,
            "histogram": {"counts": [], "bin_edges": [], "bin_centers": []},
            "country": country if country else "All"
        }
    
    # Handle potential NaN values
    stats = {
        "mean": float(df['price'].mean()) if not pd.isna(df['price'].mean()) else 0.0,
        "median": float(df['price'].median()) if not pd.isna(df['price'].median()) else 0.0,
        "min": float(df['price'].min()) if not pd.isna(df['price'].min()) else 0.0,
        "max": float(df['price'].max()) if not pd.isna(df['price'].max()) else 0.0,
        "std": float(df['price'].std()) if not pd.isna(df['price'].std()) else 0.0,
        "histogram": get_histogram_data(df, 'price', bins=20),
        "country": country if country else "All"
    }
    
    return stats

def get_area_statistics(country=None):
    """
    Calculate statistics about property areas
    
    Args:
        country: Optional filter by country ('mexico' or 'brazil')
    """
    df = load_housing_data(country)
    
    # Check if dataframe has data
    if df.empty:
        return {
            "mean": 0.0,
            "median": 0.0,
            "min": 0.0,
            "max": 0.0,
            "std": 0.0,
            "histogram": {"counts": [], "bin_edges": [], "bin_centers": []}
        }
    
    # Handle potential NaN values
    stats = {
        "mean": float(df['area'].mean()) if not pd.isna(df['area'].mean()) else 0.0,
        "median": float(df['area'].median()) if not pd.isna(df['area'].median()) else 0.0,
        "min": float(df['area'].min()) if not pd.isna(df['area'].min()) else 0.0,
        "max": float(df['area'].max()) if not pd.isna(df['area'].max()) else 0.0,
        "std": float(df['area'].std()) if not pd.isna(df['area'].std()) else 0.0,
        "histogram": get_histogram_data(df, 'area', bins=20)
    }
    
    return stats

def get_histogram_data(df, column, bins=10):
    """
    Generate histogram data for the given column
    """
    # Handle empty dataframe
    if df.empty:
        return {
            "counts": [],
            "bin_edges": [],
            "bin_centers": []
        }
    
    # Handle potential NaN values in the column
    valid_data = df[column].dropna()
    
    # If we don't have enough data for a histogram, return empty
    if len(valid_data) < 2:
        return {
            "counts": [],
            "bin_edges": [0, 1],  # Provide default bin edges
            "bin_centers": [0.5]  # Provide default bin center
        }
    
    try:
        hist, bin_edges = np.histogram(valid_data, bins=bins)
        
        # Ensure all values are JSON serializable
        return {
            "counts": hist.tolist(),
            "bin_edges": [float(edge) for edge in bin_edges.tolist()],
            "bin_centers": [float((bin_edges[i] + bin_edges[i+1])/2) for i in range(len(bin_edges)-1)]
        }
    except Exception as e:
        print(f"Error creating histogram for {column}: {e}")
        # Fallback return empty histogram
        return {
            "counts": [],
            "bin_edges": [0, 1],
            "bin_centers": [0.5]
        }

def get_location_data(country=None):
    """
    Get housing location data suitable for map visualization
    
    Args:
        country: Optional filter by country ('mexico' or 'brazil')
    """
    try:
        df = load_housing_data(country)
        
        # Check if dataframe is empty
        if df.empty:
            print(f"Empty dataframe returned for country: {country}")
            return []
        
        print(f"Location data for country {country}: {len(df)} records")
        
        # Debug information
        print(f"Columns: {df.columns.tolist()}")
        print(f"Sample data: {df.head(2).to_dict('records')}")
        print(f"Has latitude: {'latitude' in df.columns}")
        print(f"Has longitude: {'longitude' in df.columns}")
        
        # If no lat/lon, check for alternative columns
        if 'latitude' not in df.columns or 'longitude' not in df.columns:
            print("Looking for alternative location columns")
            # For Brazil data, check if there are alternative column names for coordinates
            alt_lat_cols = [col for col in df.columns if 'lat' in col.lower()]
            alt_lon_cols = [col for col in df.columns if 'lon' in col.lower() or 'lng' in col.lower()]
            
            print(f"Alternative lat columns found: {alt_lat_cols}")
            print(f"Alternative lon columns found: {alt_lon_cols}")
            
            if alt_lat_cols and 'latitude' not in df.columns:
                df['latitude'] = df[alt_lat_cols[0]]
                print(f"Using {alt_lat_cols[0]} as latitude")
                
            if alt_lon_cols and 'longitude' not in df.columns:
                df['longitude'] = df[alt_lon_cols[0]]
                print(f"Using {alt_lon_cols[0]} as longitude")
                
            # If we still don't have lat/lon, try to extract from lat-lon column again
            if ('latitude' not in df.columns or 'longitude' not in df.columns) and 'lat-lon' in df.columns:
                print("Extracting latitude and longitude from lat-lon column")
                try:
                    # Handle different formats like "19.4326,-99.1332" or "(19.4326, -99.1332)"
                    df['lat-lon'] = df['lat-lon'].astype(str)
                    coords = df['lat-lon'].str.extract(r'[-+]?([0-9]*\.[0-9]+|[0-9]+)[ ,]+[-+]?([0-9]*\.[0-9]+|[0-9]+)')
                    
                    if not coords.empty and coords.shape[1] == 2:
                        df['latitude'] = pd.to_numeric(coords[0], errors='coerce')
                        df['longitude'] = pd.to_numeric(coords[1], errors='coerce')
                        print(f"Successfully extracted coordinates for {df['latitude'].notna().sum()} rows")
                    else:
                        print(f"Failed to extract coordinates from lat-lon column with standard pattern")
                        # Try another pattern
                        coords = df['lat-lon'].str.extract(r'([-\d.]+)[, ]+?([-\d.]+)')
                        if not coords.empty and coords.shape[1] == 2:
                            df['latitude'] = pd.to_numeric(coords[0], errors='coerce')
                            df['longitude'] = pd.to_numeric(coords[1], errors='coerce')
                            print(f"Successfully extracted coordinates with alternative pattern")
                        else:
                            print(f"Failed to extract coordinates from lat-lon column")
                except Exception as e:
                    print(f"Error extracting coordinates: {e}")
        
        # Filter out rows without valid location data
        location_df = df.dropna(subset=['latitude', 'longitude', 'price'])
        print(f"After filtering for valid location data: {len(location_df)} records")
        
        # Handle potential NaN values in the data
        # First, identify the columns we want to include
        columns_to_include = ['latitude', 'longitude', 'price', 'area', 'property_type', 'region']
        if 'country' in location_df.columns:
            columns_to_include.append('country')
        
        # Ensure we only include columns that exist in the dataframe
        available_columns = [col for col in columns_to_include if col in location_df.columns]
        
        # Create a clean dataframe with only the columns we need
        clean_df = location_df[available_columns].copy()
        
        # Replace any NaN values with appropriate defaults for each column
        if 'area' in clean_df.columns:
            clean_df['area'] = clean_df['area'].fillna(0.0)
        
        if 'property_type' in clean_df.columns:
            clean_df['property_type'] = clean_df['property_type'].fillna('unknown')
        
        if 'region' in clean_df.columns:
            clean_df['region'] = clean_df['region'].fillna('Unknown')
        
        if 'country' in clean_df.columns:
            clean_df['country'] = clean_df['country'].fillna('Unknown')
        
        # Convert numeric columns to explicit float to ensure JSON serialization
        for col in ['latitude', 'longitude', 'price', 'area']:
            if col in clean_df.columns:
                clean_df[col] = clean_df[col].astype(float)
        
        # Check for any remaining NaN values and remove those rows
        clean_df = clean_df.dropna()
        
        print(f"Final location data: {len(clean_df)} records")
        print(f"Columns in final data: {clean_df.columns.tolist()}")
        
        # Convert to records
        locations = clean_df.to_dict('records')
        
        # Final validation of each record to ensure all values are JSON serializable
        validated_locations = []
        for location in locations:
            valid_location = {}
            for key, value in location.items():
                if pd.isna(value):
                    # Handle specific column types
                    if key in ['latitude', 'longitude', 'price', 'area']:
                        valid_location[key] = 0.0
                    else:
                        valid_location[key] = 'unknown'
                else:
                    valid_location[key] = value
            validated_locations.append(valid_location)
        
        return validated_locations
        
    except Exception as e:
        print(f"Error in get_location_data with country={country}: {e}")
        import traceback
        traceback.print_exc()
        # Return empty list instead of failing
        return []

def get_property_types(country=None):
    """
    Get property type distribution
    
    Args:
        country: Optional filter by country ('mexico' or 'brazil')
    """
    df = load_housing_data(country)
    
    # Count occurrences of each property type
    property_counts = df['property_type'].value_counts().reset_index()
    property_counts.columns = ['property_type', 'count']
    
    return property_counts.to_dict('records')

def get_region_statistics(country=None):
    """
    Get statistics grouped by region
    
    Args:
        country: Optional filter by country ('mexico' or 'brazil')
    """
    df = load_housing_data(country)
    
    # Group by region and calculate statistics
    region_stats = df.groupby('region').agg({
        'price': ['mean', 'median', 'count'],
        'area': ['mean', 'median']
    }).reset_index()
    
    # Flatten the multi-level columns
    region_stats.columns = ['_'.join(col).strip('_') if col[1] else col[0] for col in region_stats.columns.values]
    
    return region_stats.to_dict('records')

def get_countries():
    """
    Get list of available countries in the dataset
    """
    df = load_housing_data()
    countries = df['country'].unique().tolist()
    return countries