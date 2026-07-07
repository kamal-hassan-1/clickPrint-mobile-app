//----------------------------------- IMPORTS -----------------------------------//

import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Alert, Linking, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { useShops } from "../../hooks/useShops";
import { toLatLng } from "../../utils/shopLocation";

//----------------------------------- COMPONENTS -----------------------------------//

const ShopsPage = () => {
	const router = useRouter();
	const { shops, loading, error, refresh, refreshing, reload } = useShops();

	useFocusEffect(
		useCallback(() => {
			reload();
		}, [reload])
	);

	const goToShopDetails = (shopId) => {
		router.push(`/shop/${shopId}?from=shops`);
	};

	const openShopLocation = async (shop) => {
		const latLng = toLatLng(shop.coordinates);
		if (!latLng) {
			Alert.alert("Location unavailable", "This shop hasn't set its location yet.");
			return;
		}
		const url = `https://www.google.com/maps/search/?api=1&query=${latLng.latitude},${latLng.longitude}`;
		try {
			await Linking.openURL(url);
		} catch {
			Alert.alert("Unable to open maps", "Please try again.");
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Shops</Text>
				<TouchableOpacity onPress={refresh} style={styles.refreshButton}>
					{refreshing ? <ActivityIndicator size="small" color={colors.textPrimary} /> : <Feather name="refresh-cw" size={20} color={colors.textPrimary} />}
				</TouchableOpacity>
			</View>

			{loading ? (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color={colors.primary} />
					<Text style={styles.loadingText}>Loading shops...</Text>
				</View>
			) : error && shops.length === 0 ? (
				<View style={styles.centerContainer}>
					<Feather name="alert-circle" size={40} color={colors.printRequest} />
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity style={styles.retryButton} onPress={refresh}>
						<Text style={styles.retryButtonText}>Retry</Text>
					</TouchableOpacity>
				</View>
			) : (
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
				>
					{shops.length === 0 ? (
						<View style={styles.centerContainer}>
							<Feather name="shopping-bag" size={40} color={colors.textSecondary} />
							<Text style={styles.errorText}>No shops available</Text>
						</View>
					) : (
						shops.map((shop) => (
							<ShopListItem key={shop._id} shop={shop} onPress={() => goToShopDetails(shop._id)} onViewLocation={() => openShopLocation(shop)} />
						))
					)}
				</ScrollView>
			)}
		</SafeAreaView>
	);
};

const ShopListItem = ({ shop, onPress, onViewLocation }) => {
	return (
		<TouchableOpacity style={styles.shopCard} onPress={onPress} activeOpacity={0.7}>
			{shop.imageUrl ? (
				<Image source={{ uri: shop.imageUrl }} style={styles.shopImage} contentFit="cover" transition={200} />
			) : (
				<View style={styles.shopIconContainer}>
					<Feather name="shopping-bag" size={24} color={colors.printRequest} />
				</View>
			)}

			<View style={styles.shopInfo}>
				<Text style={styles.shopName} numberOfLines={1}>
					{shop.name}
				</Text>
				<Text style={styles.shopAddress} numberOfLines={1}>
					{shop.address}
				</Text>
				{shop.timings && shop.timings.length > 0 && (
					<View style={styles.timingRow}>
						<Feather name="clock" size={12} color={colors.textSecondary} />
						<Text style={styles.timingText} numberOfLines={1}>
							{shop.timings[0]}
						</Text>
					</View>
				)}
				<View style={styles.shopMeta}>
					<View style={[styles.statusDot, shop.isOnline ? styles.statusDotOnline : styles.statusDotOffline]} />
					<Text style={[styles.statusText, shop.isOnline ? styles.statusTextOnline : styles.statusTextOffline]}>{shop.isOnline ? "Online" : "Offline"}</Text>
				</View>

				<TouchableOpacity style={styles.viewLocationButton} onPress={onViewLocation} activeOpacity={0.7}>
					<Feather name="map-pin" size={15} color={colors.cardBackground} />
					<Text style={styles.viewLocationText}>View Location</Text>
				</TouchableOpacity>
			</View>

			<Feather name="chevron-right" size={20} color={colors.textSecondary} />
		</TouchableOpacity>
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
	headerTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: colors.textPrimary,
	},
	refreshButton: {
		width: 36,
		height: 36,
		justifyContent: "center",
		alignItems: "center",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 20,
		gap: 12,
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
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
	shopCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.cardBackground,
		borderRadius: 16,
		padding: 14,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: colors.borderLight,
		shadowColor: colors.shadowLight,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 1,
		shadowRadius: 8,
		elevation: 2,
	},
	shopImage: {
		width: 56,
		height: 56,
		borderRadius: 12,
		marginRight: 14,
		backgroundColor: colors.background,
	},
	shopIconContainer: {
		width: 56,
		height: 56,
		borderRadius: 12,
		backgroundColor: "#FFE8E5",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 14,
	},
	shopInfo: {
		flex: 1,
		gap: 4,
	},
	shopName: {
		fontSize: 16,
		fontWeight: "700",
		color: colors.textPrimary,
	},
	shopAddress: {
		fontSize: 13,
		color: colors.textSecondary,
	},
	timingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	timingText: {
		fontSize: 12,
		color: colors.textSecondary,
		flexShrink: 1,
	},
	shopMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginTop: 2,
	},
	statusDot: {
		width: 7,
		height: 7,
		borderRadius: 4,
	},
	statusDotOnline: {
		backgroundColor: colors.primary,
	},
	statusDotOffline: {
		backgroundColor: colors.textSecondary,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "600",
	},
	statusTextOnline: {
		color: colors.primary,
	},
	statusTextOffline: {
		color: colors.textSecondary,
	},
	viewLocationButton: {
		backgroundColor: colors.printRequest,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "flex-start",   
		paddingVertical: 8,
		paddingHorizontal: 10, 
		marginTop: 5,    
		borderRadius: 15,
		gap: 4,                    
		minWidth: 200,
	},
	viewLocationText: {
		fontSize: 12,
		fontWeight: "600",
		color: colors.cardBackground,
		textAlign: "center",
	},
});

export default ShopsPage;
