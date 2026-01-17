import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationChange, initialLocation = null, readOnly = false }) => {
  const [position, setPosition] = useState(initialLocation ? [initialLocation.latitude, initialLocation.longitude] : [28.6139, 77.2090]); // Default to Delhi
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [city, setCity] = useState(initialLocation?.city || '');
  const [state, setState] = useState(initialLocation?.state || '');
  const [zipCode, setZipCode] = useState(initialLocation?.zipCode || '');
  const [country, setCountry] = useState(initialLocation?.country || '');

  useEffect(() => {
    if (initialLocation) {
      setPosition([initialLocation.latitude, initialLocation.longitude]);
      setAddress(initialLocation.address || '');
      setCity(initialLocation.city || '');
      setState(initialLocation.state || '');
      setZipCode(initialLocation.zipCode || '');
      setCountry(initialLocation.country || '');
    }
  }, [initialLocation]);

  // Reverse geocoding function (using Nominatim)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data.address) {
        const addr = data.address;
        setAddress(addr.road || addr.house_number ? `${addr.house_number || ''} ${addr.road || ''}`.trim() : '');
        setCity(addr.city || addr.town || addr.village || '');
        setState(addr.state || '');
        setZipCode(addr.postcode || '');
        setCountry(addr.country || '');
        
        // Notify parent component
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: addr.road || addr.house_number ? `${addr.house_number || ''} ${addr.road || ''}`.trim() : '',
          city: addr.city || addr.town || addr.village || '',
          state: addr.state || '',
          zipCode: addr.postcode || '',
          country: addr.country || '',
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (!readOnly) {
          const { lat, lng } = e.latlng;
          setPosition([lat, lng]);
          reverseGeocode(lat, lng);
        }
      },
    });
    return null;
  };

  const handleAddressChange = (field, value) => {
    if (field === 'address') setAddress(value);
    if (field === 'city') setCity(value);
    if (field === 'state') setState(value);
    if (field === 'zipCode') setZipCode(value);
    if (field === 'country') setCountry(value);

    // Notify parent component
    onLocationChange({
      latitude: position[0],
      longitude: position[1],
      address: field === 'address' ? value : address,
      city: field === 'city' ? value : city,
      state: field === 'state' ? value : state,
      zipCode: field === 'zipCode' ? value : zipCode,
      country: field === 'country' ? value : country,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
          Service Location {!readOnly && '*'}
        </label>
        <div className="border border-slate-300 dark:border-neutral-700 rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} />
            {!readOnly && <MapClickHandler />}
          </MapContainer>
        </div>
        {!readOnly && (
          <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">
            Click on the map to set the service location
          </p>
        )}
      </div>

      {!readOnly && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => handleAddressChange('address', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Street address"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="State"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="ZIP Code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Country"
              />
            </div>
          </div>
        </div>
      )}

      {readOnly && address && (
        <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700">
          <p className="text-sm text-slate-700 dark:text-neutral-300">
            <span className="font-semibold">Address:</span>{' '}
            {[address, city, state, zipCode, country].filter(Boolean).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
