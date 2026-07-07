import { useCallback, useEffect, useState } from "react";
import { fetchShops } from "../services/fetchShops";

export const useShops = () => {
	const [shops, setShops] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [refreshing, setRefreshing] = useState(false);

	const loadShops = useCallback(async () => {
		try {
			setError(null);
			const data = await fetchShops();
			setShops(data);
		} catch (err) {
			setError(err.message || "Failed to fetch shops");
			console.error("Error loading shops:", err);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useEffect(() => {
		loadShops();
	}, [loadShops]);

	const refresh = useCallback(async () => {
		setRefreshing(true);
		await loadShops();
	}, [loadShops]);

	return {
		shops,
		loading,
		error,
		refreshing,
		refresh,
		reload: loadShops,
	};
};
