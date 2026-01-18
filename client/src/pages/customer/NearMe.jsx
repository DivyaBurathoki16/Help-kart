import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
import PageHeader from '../../components/PageHeader';

// Fix for default marker icon in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom service marker icon
const createServiceIcon = (color = '#2563eb') => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to fit map bounds to show all markers
const MapBounds = ({ services, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (services.length === 0) return;

    const bounds = L.latLngBounds([]);
    
    // Add user location if available
    if (userLocation?.latitude && userLocation?.longitude) {
      bounds.extend([userLocation.latitude, userLocation.longitude]);
    }

    // Add all service locations
    services.forEach(service => {
      if (service.location?.latitude && service.location?.longitude) {
        bounds.extend([service.location.latitude, service.location.longitude]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [services, userLocation, map]);

  return null;
};

// Component to handle Ctrl+scroll zoom
const ScrollZoomHandler = () => {
  const map = useMap();

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
        e.originalEvent.preventDefault();
        const delta = e.originalEvent.deltaY;
        const zoom = map.getZoom();
        map.setZoom(zoom - delta * 0.003);
      }
    };

    map.on('wheel', handleWheel);

    return () => {
      map.off('wheel', handleWheel);
    };
  }, [map]);

  return null;
};

const NearMe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const response = await axios.get(getApiUrl('api/auth/me'));
      if (response.data.user?.location?.latitude && response.data.user?.location?.longitude) {
        setUserLocation(response.data.user.location);
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = { sortBy: 'distance' };
      const response = await axios.get(getApiUrl('api/services'), { params });
      const servicesData = response.data.services || [];
      
      // Filter services that have location data
      const servicesWithLocation = servicesData.filter(
        service => service.location?.latitude && service.location?.longitude
      );
      
      setServices(servicesWithLocation);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (service) => {
    navigate(`/services/${service._id}`);
  };

  // Get default center (user location or Delhi)
  const getDefaultCenter = () => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return [userLocation.latitude, userLocation.longitude];
    }
    return [28.6139, 77.2090]; // Default to Delhi
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-neutral-300">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Gradient */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-6 md:p-8 border border-blue-100/50 dark:border-neutral-700/50">
          <div className="flex items-start gap-4">
            <div className="text-4xl md:text-5xl"></div>
            <div className="flex-1">
              <PageHeader
                title="Services Near Me"
                subtitle="Discover trusted services around your location"
              />
            </div>
          </div>
        </div>

        {/* Sticky Info Bar */}
        {services.length > 0 && (
          <div className="sticky top-4 z-20 mb-6">
            <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-slate-200/50 dark:border-neutral-700/50 inline-flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
                Showing <span className="text-blue-600 dark:text-blue-400">{services.length}</span> nearby {services.length === 1 ? 'service' : 'services'}
              </span>
            </div>
          </div>
        )}

        {/* Info Banner */}
        {!userLocation && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>💡 Tip:</strong> Add your location in{' '}
              <button
                onClick={() => navigate('/customer/profile')}
                className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
              >
                your profile
              </button>{' '}
              to see services sorted by distance from you!
            </p>
          </div>
        )}

        {/* Split Layout: Map + Services List */}
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-280px)] min-h-[600px] max-h-[800px]">
          {/* Map Container - Left Side */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-700 ring-1 ring-black/5 dark:ring-white/10 h-full flex flex-col">
            <div className="relative flex-1 min-h-0">
            {/* Floating Map Label */}
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-slate-200/50 dark:border-neutral-700/50">
              <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                <span>📍</span>
                <span>Services around you</span>
              </p>
            </div>

            {/* Scroll Hint */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-black/70 dark:bg-neutral-900/90 backdrop-blur-md text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-white/10">
              <span className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">Ctrl</kbd>
                <span>+</span>
                <span>scroll to zoom</span>
              </span>
            </div>

            <MapContainer
              center={getDefaultCenter()}
              zoom={userLocation ? 12 : 10}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
              dragging={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={new Icon({
                    iconUrl: `data:image/svg+xml;base64,${btoa(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="15" fill="#10b981" stroke="white" stroke-width="3"/>
                        <circle cx="20" cy="20" r="8" fill="white"/>
                      </svg>
                    `)}`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Your Location</strong>
                      <br />
                      {userLocation.city && <span>{userLocation.city}</span>}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Service Markers */}
              {services.map((service, index) => {
                if (!service.location?.latitude || !service.location?.longitude) return null;

                const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                const color = colors[index % colors.length];

                return (
                  <Marker
                    key={service._id}
                    position={[service.location.latitude, service.location.longitude]}
                    icon={createServiceIcon(color)}
                    eventHandlers={{
                      click: () => handleMarkerClick(service),
                    }}
                  >
                    <Tooltip 
                      permanent={false}
                      direction="top"
                      offset={[0, -10]}
                      className="custom-tooltip"
                    >
                      <div className="space-y-1 min-w-[180px]">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100 leading-tight">
                          {service.title}
                        </h4>
                        {service.provider?.businessName && (
                          <p className="text-xs text-slate-600 dark:text-neutral-300 font-medium">
                            {service.provider.businessName}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-neutral-600">
                          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                            ₹{service.price}
                          </span>
                          {service.distance !== undefined && service.distance !== null && (
                            <span className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                              <span>📍</span>
                              <span>{service.distance.toFixed(1)} km</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </Tooltip>
                    <Popup>
                      <div className="min-w-[220px] space-y-2">
                        <h3 className="font-semibold text-base text-slate-900 dark:text-neutral-100 leading-tight">
                          {service.title}
                        </h3>

                        {service.provider?.businessName && (
                          <p className="text-xs text-slate-500 dark:text-neutral-400">
                            by {service.provider.businessName}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-neutral-700">
                          <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                            ₹{service.price}
                          </span>
                          {service.distance !== undefined && service.distance !== null && (
                            <span className="text-xs text-slate-400 dark:text-neutral-500 flex items-center gap-1">
                              <span>📍</span>
                              <span>{service.distance.toFixed(1)} km</span>
                            </span>
                          )}
                        </div>

                        {service.location.city && (
                          <p className="text-xs text-slate-400 dark:text-neutral-500">
                            {service.location.city}
                            {service.location.state && `, ${service.location.state}`}
                          </p>
                        )}

                        <button
                          onClick={() => handleMarkerClick(service)}
                          className="w-full mt-2 bg-blue-600 text-white text-sm font-semibold rounded-lg py-2 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                        >
                          View Details
                          <span>→</span>
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Fit bounds to show all markers */}
              <MapBounds services={services} userLocation={userLocation} />
              
              {/* Handle Ctrl+scroll zoom */}
              <ScrollZoomHandler />
            </MapContainer>
            </div>
          </div>

          {/* Services List - Right Side */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-700 ring-1 ring-black/5 dark:ring-white/10 h-full flex flex-col overflow-hidden">
            {services.length > 0 ? (
              <>
                {/* Services List Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-neutral-700 flex items-center justify-between flex-shrink-0">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                    Services on Map
                  </h2>
                  <span className="text-sm text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-700 px-3 py-1 rounded-full">
                    {services.length} {services.length === 1 ? 'service' : 'services'}
                  </span>
                </div>

                {/* Scrollable Services List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {services.map((service) => (
                    <div
                      key={service._id}
                      onClick={() => navigate(`/services/${service._id}`)}
                      className="group bg-slate-50 dark:bg-neutral-900 rounded-xl p-4 border border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg cursor-pointer transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Distance Badge */}
                      {service.distance !== undefined && service.distance !== null && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
                          <span>📍</span>
                          <span>{service.distance.toFixed(1)} km</span>
                        </span>
                      )}

                      <div className="pr-20">
                        <h3 className="font-bold text-slate-900 dark:text-neutral-100 mb-1 text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {service.title}
                        </h3>
                        {service.provider?.businessName && (
                          <p className="text-sm text-slate-600 dark:text-neutral-400 mb-2">
                            by {service.provider.businessName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-neutral-700">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{service.price}
                        </span>
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="text-5xl mb-4">🗺️</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">
                    No nearby services found
                  </h3>
                  <p className="text-slate-500 dark:text-neutral-400 mb-4 text-sm">
                    Try updating your location or browse all available services.
                  </p>
                  <button
                    onClick={() => navigate('/services')}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 text-sm"
                  >
                    Browse All Services
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NearMe;
