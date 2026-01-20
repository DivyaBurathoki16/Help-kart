/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Check if coordinates are valid
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
  }

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate distance from customer location to service location
 * @param {Object} customerLocation - Customer location object with latitude and longitude
 * @param {Object} serviceLocation - Service location object with latitude and longitude
 * @returns {number|null} Distance in kilometers or null if coordinates are missing
 */
export const getDistanceFromCustomer = (customerLocation, serviceLocation) => {
  if (
    !customerLocation?.latitude ||
    !customerLocation?.longitude ||
    !serviceLocation?.latitude ||
    !serviceLocation?.longitude
  ) {
    return null;
  }

  return calculateDistance(
    customerLocation.latitude,
    customerLocation.longitude,
    serviceLocation.latitude,
    serviceLocation.longitude
  );
};
