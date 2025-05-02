import React, { useState, useEffect } from 'react';
import { modelApi } from '@/services/api';
import { ModelFeatures, PredictionResult, FeatureImportance } from '@/types/housing';

const PredictionForm: React.FC = () => {
  const [features, setFeatures] = useState<ModelFeatures | null>(null);
  const [featureValues, setFeatureValues] = useState<Record<string, number>>({});
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch model features on component mount
  useEffect(() => {
    const fetchModelData = async () => {
      try {
        const [featuresData, importanceData] = await Promise.all([
          modelApi.getFeatures(),
          modelApi.getFeatureImportance()
        ]);
        
        setFeatures(featuresData);
        setFeatureImportance(importanceData);
        
        // Initialize feature values with zeros
        if (featuresData.features) {
          const initialValues: Record<string, number> = {};
          featuresData.features.forEach((feature: string) => {
            initialValues[feature] = 0;
          });
          setFeatureValues(initialValues);
        }
      } catch (err) {
        console.error('Error fetching model data', err);
        setError('Failed to load prediction model data');
      }
    };
    
    fetchModelData();
  }, []);

  // Handle input change
  const handleInputChange = (feature: string, value: string) => {
    setFeatureValues(prevValues => ({
      ...prevValues,
      [feature]: parseFloat(value) || 0
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await modelApi.predictPrice(featureValues);
      setPrediction(result);
    } catch (err: unknown) {
      console.error('Error making prediction', err);
      // Type guard to check if error has a message property
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to make prediction';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!features) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading prediction model...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Housing Price Prediction</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {features.model_score && (
        <div className="mb-4 text-sm bg-blue-50 p-3 rounded">
          <p className="font-medium">Model Accuracy Score: {(features.model_score * 100).toFixed(2)}%</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {features.features.map((feature) => (
            <div key={feature} className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {feature.charAt(0).toUpperCase() + feature.slice(1).replace('_', ' ')}
                {featureImportance && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Importance: {(featureImportance[feature] * 100).toFixed(1)}%)
                  </span>
                )}
              </label>
              <input
                type="number"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder={`Enter ${feature}`}
                value={featureValues[feature] || ''}
                onChange={(e) => handleInputChange(feature, e.target.value)}
                step="any"
                min="0"
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Predicting...' : 'Predict Price'}
          </button>
        </div>
      </form>
      
      {prediction && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Predicted Price</h3>
          <p className="text-3xl font-bold text-green-700">
            ${prediction.predicted_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Based on the input features you provided
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;