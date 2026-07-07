//----------------------------------- IMPORTS -----------------------------------//

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { useShops } from "../hooks/useShops";
import { getInitialRegion, toLatLng } from "../utils/shopLocation";

//----------------------------------- COMPONENTS -----------------------------------//

const ShopsMapPage = () => {
	const router = useRouter();
	const { shops, loading, error, refresh, refreshing } = useShops();

	const locatedShops = useMemo(() => {
		return shops
			.map((shop) => ({ shop, latLng: toLatLng(shop.coordinates) }))
			.filter((entry) => entry.latLng !== null);
	}, [shops]);

	const unlocatedCount = shops.length - locatedShops.length;
	const initialRegion = useMemo(() => getInitialRegion(locatedShops), [locatedShops]);

	const goToShopDetails = (shopId) => {
		router.push(`/shop/${shopId}`);
	};

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.cardBackground} />
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
					<Feather name="arrow-left" size={24} color={colors.textPrimary} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Shops Map</Text>
				<TouchableOpacity onPress={refresh} style={styles.refreshButton}>
					{refreshing ? <ActivityIndicator size="small" color={colors.textPrimary} /> : <Feather name="refresh-cw" size={20} color={colors.textPrimary} />}
				</TouchableOpacity>
			</View>

			{unlocatedCount > 0 && (
				<View style={styles.noticeBanner}>
					<Feather name="info" size={14} color={colors.textSecondary} />
					<Text style={styles.noticeText}>
						{unlocatedCount} shop{unlocatedCount > 1 ? "s" : ""} without a location {unlocatedCount > 1 ? "aren't" : "isn't"} shown on the map
					</Text>
				</View>
			)}

			<View style={styles.mapContainer}>
				<MapView style={styles.map} initialRegion={initialRegion}>
					{locatedShops.map(({ shop, latLng }) => (
						<Marker key={shop._id} coordinate={latLng}>
							<Callout onPress={() => goToShopDetails(shop._id)}>
								<View style={styles.calloutContainer}>
									<Text style={styles.calloutTitle}>{shop.name}</Text>
									<Text style={styles.calloutHint}>Tap for details</Text>
								</View>
							</Callout>
						</Marker>
					))}
				</MapView>

				{loading && (
					<View style={styles.loadingOverlay}>
						<ActivityIndicator size="large" color={colors.primary} />
						<Text style={styles.loadingText}>Loading shops...</Text>
					</View>
				)}

				{!loading && error && shops.length === 0 && (
					<View style={styles.errorOverlay}>
						<Feather name="alert-circle" size={40} color={colors.printRequest} />
						<Text style={styles.errorText}>{error}</Text>
						<TouchableOpacity style={styles.retryButton} onPress={refresh}>
							<Text style={styles.retryButtonText}>Retry</Text>
						</TouchableOpacity>
					</View>
				)}

				{!loading && !error && shops.length === 0 && (
					<View style={styles.errorOverlay}>
						<Feather name="map-pin" size={40} color={colors.textSecondary} />
						<Text style={styles.errorText}>No shops available</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
};

//----------------------------------- STYLES -----------------------------------//

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: colors.cardBackground,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderLight,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: colors.textPrimary,
	},
	refreshButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	noticeBanner: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: colors.cardBackground,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderLight,
	},
	noticeText: {
		fontSize: 12,
		color: colors.textSecondary,
		flex: 1,
	},
	mapContainer: {
		flex: 1,
	},
	map: {
		flex: 1,
	},
	calloutContainer: {
		minWidth: 160,
		padding: 4,
	},
	calloutTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: colors.textPrimary,
	},
	calloutHint: {
		fontSize: 12,
		color: colors.printRequest,
		marginTop: 4,
		fontWeight: "600",
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.background,
	},
	errorOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.background,
		padding: 20,
		gap: 12,
	},
	loadingText: {
		fontSize: 15,
		color: colors.textSecondary,
	},
	errorText: {
		fontSize: 15,
		fontWeight: "600",
		color: colors.textPrimary,
		textAlign: "center",
	},
	retryButton: {
		backgroundColor: colors.primary,
		paddingHorizontal: 28,
		paddingVertical: 10,
		borderRadius: 10,
	},
	retryButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.cardBackground,
	},
});

export default ShopsMapPage;
