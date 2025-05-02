'use client';

import { useState } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import PredictionForm from '@/components/prediction/PredictionForm';
import MapView from '@/components/map/MapView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prediction' | 'map'>('dashboard');

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-900 to-purple-900 text-white px-6 py-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">International Real Estate Analytics</h1>
          <div className="flex mt-4 md:mt-0 space-x-4">
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-blue-600 font-medium' 
                  : 'bg-blue-700 hover:bg-blue-800'
              }`} 
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'map' 
                  ? 'bg-white text-blue-600 font-medium' 
                  : 'bg-blue-700 hover:bg-blue-800'
              }`} 
              onClick={() => setActiveTab('map')}
            >
              Map View
            </button>
            <button 
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'prediction' 
                  ? 'bg-white text-blue-600 font-medium' 
                  : 'bg-blue-700 hover:bg-blue-800'
              }`} 
              onClick={() => setActiveTab('prediction')}
            >
              Predict Price
            </button>
          </div>
        </div>
      </header>

      <div className="bg-blue-50 py-6 border-b border-blue-100">
        <div className="container mx-auto px-4">
          <p className="text-lg text-blue-800">
            Explore real estate data across Mexico and Brazil with comprehensive analytics, 
            interactive maps, and predictive modeling.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'map' && <MapView />}
        {activeTab === 'prediction' && <PredictionForm />}
      </div>

      <footer className="bg-gray-800 text-white p-6 mt-10">
        <div className="container mx-auto">
          <p className="text-center">
            International Real Estate Analysis - Data Visualization and Prediction Application
          </p>
        </div>
      </footer>
    </main>
  );
}
