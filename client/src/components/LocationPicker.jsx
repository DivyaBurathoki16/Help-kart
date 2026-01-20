import { useEffect, useState, useRef } from 'react';
<<<<<<< HEAD
import { createPortal } from 'react-dom';
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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
<<<<<<< HEAD
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const debounceTimerRef = useRef(null);
  const mapRef = useRef(null);
  const lastReportedRef = useRef(null);
  const lastLocalChangeRef = useRef(0); // Timestamp of last user input
  const isTypingRef = useRef(false);

  useEffect(() => {
    // Prevent overwriting internal state if the user recently typed (within 2 seconds)
    // to avoid the race condition that causes text truncation.
    const now = Date.now();
    if (now - lastLocalChangeRef.current < 2000) {
      return;
    }

    if (initialLocation) {
      const isSameAsLastReported = lastReportedRef.current &&
        initialLocation.latitude === lastReportedRef.current.latitude &&
        initialLocation.longitude === lastReportedRef.current.longitude &&
        initialLocation.address === lastReportedRef.current.address &&
        initialLocation.city === lastReportedRef.current.city &&
        initialLocation.state === lastReportedRef.current.state &&
        initialLocation.zipCode === lastReportedRef.current.zipCode &&
        initialLocation.country === lastReportedRef.current.country;

      if (!isSameAsLastReported) {
        setPosition([initialLocation.latitude, initialLocation.longitude]);
        setAddress(initialLocation.address || '');
        setCity(initialLocation.city || '');
        setState(initialLocation.state || '');
        setZipCode(initialLocation.zipCode || '');
        setCountry(initialLocation.country || '');
      }
    }
  }, [initialLocation]);

  // Forward geocoding function with smart fallback (address → coordinates)
  const forwardGeocode = async (addressQuery) => {
    if (!addressQuery || addressQuery.trim().length < 5) {
      return;
    }

    setIsGeocoding(true);
    setGeocodeError('');

    try {
      // Strategy 1: Structured Search for high precision
      const structuredResult = await geocodeAddressStructured({
        street: address,
        city: city,
        state: state,
        postalcode: zipCode,
        country: country
      });

      let result = structuredResult;
      let searchLevel = 'exact';

      // Strategy 2: If no structured result, try the full raw query string
      if (!result) {
        result = await geocodeAddress(addressQuery);
        searchLevel = 'full-raw';
      }

      // Strategy 3: Try stripping unit/shop numbers from address (e.g. "Shop 9, MG Road" -> "MG Road")
      if (!result && address) {
        const cleanedAddress = address
          .replace(/^(Shop|Flat|Unit|Plot|Villa|Room|Office|No\.?|House|Bldg|Building|Apt|Apartment)\s*\w+\s*[,\s]*/i, '')
          .replace(/^(\d+[\w-]*)\s*[,\s]*/, '') // Remove leading numbers
          .trim();

        if (cleanedAddress && cleanedAddress !== address) {
          result = await geocodeAddress(`${cleanedAddress}, ${city}, ${country || ''}`);
          searchLevel = 'street-found';
        }
      }

      // Strategy 4: Try without the address field at all, just city/state/zip
      if (!result && (city || state || zipCode)) {
        const cityLevel = [city, state, zipCode, country].filter(Boolean).join(', ');
        result = await geocodeAddress(cityLevel);
        searchLevel = 'city-area';
      }

      // Strategy 5: Last resort - city only
      if (!result && city) {
        result = await geocodeAddress(`${city}, ${country || ''}`);
        searchLevel = 'city-only';
      }

      if (result) {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setPosition([lat, lng]);

        const newLocation = {
          latitude: lat,
          longitude: lng,
          address,
          city,
          state,
          zipCode,
          country,
        };

        lastReportedRef.current = newLocation;
        onLocationChange(newLocation);

        // Positive feedback for different search levels
        if (searchLevel === 'exact' || searchLevel === 'full-raw') {
          setGeocodeError(''); // Perfect match
        } else if (searchLevel === 'street-found') {
          setGeocodeError('📍 Location found! You can refine the marker if needed.');
        } else if (searchLevel === 'city-area') {
          setGeocodeError('📍 Area identified. Please move marker to exact shop.');
        } else if (searchLevel === 'city-only') {
          setGeocodeError('📍 Showing city center. Please move marker to your address.');
        }

        // Auto-dismiss info messages faster (4s)
        if (searchLevel !== 'exact' && searchLevel !== 'full-raw') {
          setTimeout(() => setGeocodeError(prev => prev.startsWith('📍') ? '' : prev), 4000);
        }
      } else {
        setGeocodeError('❌ Could not find this address. Try clicking on map.');
      }
    } catch (error) {
      console.error('Forward geocoding error:', error);
      setGeocodeError('❌ Geocoding service error. Enter manually.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Helper for structured geocoding
  const geocodeAddressStructured = async (params) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      limit: '1',
      addressdetails: '1',
      ...Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
    }).toString();

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${queryParams}`, {
        headers: { 'User-Agent': 'HelpKart/1.0' }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    } catch (e) { return null; }
  };

  // Helper function to make geocoding API call
  const geocodeAddress = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'HelpKart/1.0 (Service Provider Platform)',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Geocode API error:', error);
      return null;
    }
  };

=======

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

>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
  // Reverse geocoding function (using Nominatim)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
<<<<<<< HEAD

=======
      
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
      if (data.address) {
        const addr = data.address;
        setAddress(addr.road || addr.house_number ? `${addr.house_number || ''} ${addr.road || ''}`.trim() : '');
        setCity(addr.city || addr.town || addr.village || '');
        setState(addr.state || '');
        setZipCode(addr.postcode || '');
        setCountry(addr.country || '');
<<<<<<< HEAD

        // Notify parent component
        const newLocation = {
=======
        
        // Notify parent component
        onLocationChange({
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
          latitude: lat,
          longitude: lng,
          address: addr.road || addr.house_number ? `${addr.house_number || ''} ${addr.road || ''}`.trim() : '',
          city: addr.city || addr.town || addr.village || '',
          state: addr.state || '',
          zipCode: addr.postcode || '',
          country: addr.country || '',
<<<<<<< HEAD
        };

        lastReportedRef.current = newLocation;
        onLocationChange(newLocation);
=======
        });
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Map interaction handler - enables scroll zoom and dragging on hover
  const MapInteractionHandler = () => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      // Enable interactions when user hovers over the map
      const handleMouseEnter = () => {
        map.scrollWheelZoom.enable();
        map.dragging.enable();
      };

      // For readOnly maps, disable on mouse leave to prevent scroll hijacking
      // For editable maps, keep enabled for better UX
      const handleMouseLeave = () => {
        if (readOnly) {
          map.scrollWheelZoom.disable();
          map.dragging.disable();
        }
      };

      // Enable interactions on mouse enter
      map.on('mouseenter', handleMouseEnter);
<<<<<<< HEAD

=======
      
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
      // For readOnly maps, disable on mouse leave
      if (readOnly) {
        map.on('mouseout', handleMouseLeave);
      }

      return () => {
        map.off('mouseenter', handleMouseEnter);
        if (readOnly) {
          map.off('mouseout', handleMouseLeave);
        }
      };
    }, [map, readOnly]);

    return null;
  };

  // Map click handler component for setting location
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
<<<<<<< HEAD
    // Mark as local change with timestamp to "lock" state sync
    lastLocalChangeRef.current = Date.now();
    isTypingRef.current = true;

    // Update the appropriate field
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
    if (field === 'address') setAddress(value);
    if (field === 'city') setCity(value);
    if (field === 'state') setState(value);
    if (field === 'zipCode') setZipCode(value);
    if (field === 'country') setCountry(value);

<<<<<<< HEAD
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Build full address query
    const fullAddress = [
      field === 'address' ? value : address,
      field === 'city' ? value : city,
      field === 'state' ? value : state,
      field === 'zipCode' ? value : zipCode,
      field === 'country' ? value : country,
    ]
      .filter(Boolean)
      .join(', ');

    // Debounce geocoding (wait 1s after user stops typing)
    debounceTimerRef.current = setTimeout(() => {
      if (fullAddress.trim().length >= 10) {
        // Only geocode if we have substantial address
        forwardGeocode(fullAddress);
      }
    }, 1000);

    // Build the current location report
    const currentReport = {
=======
    // Notify parent component
    onLocationChange({
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
      latitude: position[0],
      longitude: position[1],
      address: field === 'address' ? value : address,
      city: field === 'city' ? value : city,
      state: field === 'state' ? value : state,
      zipCode: field === 'zipCode' ? value : zipCode,
      country: field === 'country' ? value : country,
<<<<<<< HEAD
    };

    // Cache this as the last reported location to prevent the circular update loop
    lastReportedRef.current = currentReport;

    // Notify parent component immediately with current values
    onLocationChange(currentReport);
  };

  // Component to update map center when position changes
  const MapUpdater = () => {
    const map = useMap();

    useEffect(() => {
      if (map && position) {
        map.setView(position, map.getZoom() || 15, { animate: true });
        // Handle map size update when entering/exiting fullscreen
        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      }
    }, [map, position, isFullscreen]);

    return null;
  };

  // Render the map content (common part)
  const renderMapContent = (fs = false) => (
    <>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <MapInteractionHandler />
        <MapUpdater />
        {!readOnly && <MapClickHandler />}
      </MapContainer>

      {/* Fullscreen Toggle / Close Button */}
      <button
        type="button"
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 left-4 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg z-[1000] hover:bg-white dark:hover:bg-neutral-700 transition-all text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 group ring-4 ring-transparent hover:ring-blue-500/10"
        title={isFullscreen ? "Exit Fullscreen" : "Expand Map"}
      >
        {isFullscreen ? (
          <svg className="h-6 w-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>

      {/* Confirm Button - only in fullscreen */}
      {isFullscreen && fs && (
        <button
          type="button"
          onClick={() => setIsFullscreen(false)}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-10 py-4 rounded-2xl shadow-2xl z-[1000] font-bold hover:bg-blue-700 transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 group ring-8 ring-blue-500/10"
        >
          <svg className="h-6 w-6 transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          Confirm Location
        </button>
      )}

      {/* Loading & Status badges */}
      {isGeocoding && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg text-sm z-[1000] pointer-events-none flex items-center gap-3 font-semibold backdrop-blur-md bg-blue-500/90 ring-4 ring-blue-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Finding location...
        </div>
      )}

      {geocodeError && !isGeocoding && (
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-xl shadow-lg text-sm z-[1000] pointer-events-none flex items-center gap-3 font-semibold backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300 ${geocodeError.startsWith('📍')
          ? 'bg-amber-500/95 text-white ring-4 ring-amber-500/20'
          : 'bg-rose-500/95 text-white ring-4 ring-rose-500/20'
          }`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={geocodeError.startsWith('📍')
              ? "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            } />
          </svg>
          {geocodeError}
        </div>
      )}

      {!readOnly && (
        <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl text-xs text-slate-700 dark:text-neutral-300 z-[1000] pointer-events-none text-center border border-slate-200/50 dark:border-neutral-700/50 leading-relaxed font-medium">
          {fs ? "Drag marker or click anywhere to pinpoint your exact shop location. Use the button above to confirm." : "Expand map for better precision • Click to set location"}
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-neutral-300 mb-3 ml-1">
          {readOnly ? 'Location' : 'Service Location'} {!readOnly && <span className="text-rose-500">*</span>}
        </label>

        {/* Standard Map View */}
        <div className="relative border-2 border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden h-[450px] md:min-h-[350px] lg:h-[450px] shadow-inner bg-slate-100 dark:bg-neutral-950">
          {renderMapContent(false)}
        </div>

        {/* Portaled Fullscreen Map View */}
        {isFullscreen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-8 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full h-full bg-white dark:bg-neutral-900 md:rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/20">
              {renderMapContent(true)}
            </div>
          </div>,
          document.body
        )}
        {!readOnly && (
          <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">
            💡 Type your address below - the map will automatically update! You can also click on the map to set a precise location.
=======
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
          {readOnly ? 'Location' : 'Location'} {!readOnly && '*'}
        </label>
        <div className="relative border border-slate-300 dark:border-neutral-700 rounded-lg overflow-hidden h-[400px] md:min-h-[300px] lg:h-[400px]">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
            dragging={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} />
            <MapInteractionHandler />
            {!readOnly && <MapClickHandler />}
          </MapContainer>
          {readOnly && (
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs text-slate-700 dark:text-neutral-300 z-[1000] pointer-events-none">
              Hover over map to interact
            </div>
          )}
          {!readOnly && (
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs text-slate-700 dark:text-neutral-300 z-[1000] pointer-events-none">
              Hover over map to scroll and zoom, click to set location
            </div>
          )}
        </div>
        {!readOnly && (
          <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">
            Hover over the map to scroll and zoom. Click on the map to set your location.
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
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
