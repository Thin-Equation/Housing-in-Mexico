// Housing data types
export interface HousingData {
  price: number;
  area: number;
  rooms: number;
  bathrooms: number;
  property_type: string;
  region: string;
  latitude?: number;
  longitude?: number;
  [key: string]: number | string | undefined; // More specific indexable type
}

// Statistics types
export interface HistogramData {
  counts: number[];
  bin_edges: number[];
  bin_centers: number[];
}

export interface Statistics {
  mean: number;
  median: number;
  min: number;
  max: number;
  std: number;
  histogram: HistogramData;
}

// Location data for maps
export interface LocationData {
  latitude: number;
  longitude: number;
  price: number;
  area: number;
  property_type: string;
}

// Property type distribution
export interface PropertyType {
  property_type: string;
  count: number;
}

// Region statistics
export interface RegionStat {
  region: string;
  price_mean: number;
  price_median: number;
  price_count: number;
  area_mean: number;
  area_median: number;
}

// API response types
export interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  data: T[];
}

// Model-related types
export interface ModelFeatures {
  features: string[];
  model_score: number;
}

export interface FeatureImportance {
  [feature: string]: number;
}

export interface PredictionResult {
  predicted_price: number;
  input_features: Record<string, number | string>; // More specific record type
}