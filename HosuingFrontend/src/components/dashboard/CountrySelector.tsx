import { useEffect, useState } from 'react';
import { housingApi } from '@/services/api';

interface CountrySelectorProps {
  selectedCountry: string | null;
  onCountryChange: (country: string | null) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  selectedCountry, 
  onCountryChange 
}) => {
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch available countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await housingApi.getCountries();
        setCountries(response.countries || []);
      } catch (error) {
        console.error('Failed to fetch countries', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Handle selection change
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onCountryChange(value === 'all' ? null : value.toLowerCase());
  };

  if (loading) {
    return <div className="h-10 w-40 bg-gray-100 animate-pulse rounded"></div>;
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="country-select" className="font-medium text-gray-700">
        Country:
      </label>
      <select
        id="country-select"
        className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        value={selectedCountry || 'all'}
        onChange={handleChange}
      >
        <option value="all">All Countries</option>
        {countries.map((country) => (
          <option key={country} value={country.toLowerCase()}>
            {country}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySelector;