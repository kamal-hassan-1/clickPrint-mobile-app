// Fallback region (Pakistan-wide) used when no shop has usable coordinates yet.
export const DEFAULT_REGION = {
	latitude: 30.3753,
	longitude: 69.3451,
	latitudeDelta: 8,
	longitudeDelta: 8,
};

// Backend stores coordinates as a plain [Number] pair; we treat it as [latitude, longitude].
export const toLatLng = (coordinates) => {
	if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;
	const [latitude, longitude] = coordinates;
	if (typeof latitude !== "number" || typeof longitude !== "number") return null;
	if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
	return { latitude, longitude };
};

export const getInitialRegion = (locatedShops) => {
	if (locatedShops.length === 0) return DEFAULT_REGION;

	const lats = locatedShops.map((s) => s.latLng.latitude);
	const lngs = locatedShops.map((s) => s.latLng.longitude);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);

	return {
		latitude: (minLat + maxLat) / 2,
		longitude: (minLng + maxLng) / 2,
		latitudeDelta: Math.max(maxLat - minLat, 0.05) * 1.6,
		longitudeDelta: Math.max(maxLng - minLng, 0.05) * 1.6,
	};
};
