//----------------------------------- IMPORTS -----------------------------------//

import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { useActiveJobs } from "../../hooks/useActiveJobs";
import ActiveJobCard from "../components/ActiveJobCard";
import TransactionList from "../components/TransactionList";

//----------------------------------- COMPONENTS -----------------------------------//

const Jobs = () => {
	const router = useRouter();
	const { activeJobs, allJobs, loading, error, refreshing, refresh } = useActiveJobs();
	const [activeTab, setActiveTab] = useState("active");

	useFocusEffect(
		useCallback(() => {
			refresh();
		}, [refresh])
	);

	//----------------------------------- RENDER -----------------------------------//

	if (loading) {
		return (
			<SafeAreaView style={styles.container} edges={["top"]}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Jobs</Text>
				</View>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primary} />
					<Text style={styles.loadingText}>Loading jobs...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView style={styles.container} edges={["top"]}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Jobs</Text>
				</View>
				<View style={styles.errorContainer}>
					<Feather name="alert-circle" size={48} color={colors.printRequest} />
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity style={styles.retryButton} onPress={refresh}>
						<Text style={styles.retryButtonText}>Retry</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.background} />

			<View style={styles.header}>
				<Text style={styles.headerTitle}>Jobs</Text>
			</View>

			{/* Segmented Control */}
			<View style={styles.segmentedControlContainer}>
				<View style={styles.segmentedControl}>
					<TouchableOpacity
						style={[styles.segmentButton, activeTab === "active" && styles.segmentButtonActive]}
						onPress={() => setActiveTab("active")}
					>
						<Text style={[styles.segmentText, activeTab === "active" && styles.segmentTextActive]}>Active</Text>
						{activeJobs.length > 0 && (
							<View style={[styles.segmentBadge, activeTab === "active" && styles.segmentBadgeActive]}>
								<Text style={[styles.segmentBadgeText, activeTab === "active" && styles.segmentBadgeTextActive]}>
									{activeJobs.length}
								</Text>
							</View>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.segmentButton, activeTab === "all" && styles.segmentButtonActive]}
						onPress={() => setActiveTab("all")}
					>
						<Text style={[styles.segmentText, activeTab === "all" && styles.segmentTextActive]}>All Jobs</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Scrollable Content */}
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} tintColor={colors.primary} />
				}
			>
				{activeTab === "active" ? (
					activeJobs.length === 0 ? (
						<View style={styles.emptyContainer}>
							<Feather name="check-circle" size={48} color={colors.primary} />
							<Text style={styles.emptyTitle}>No Active Jobs</Text>
							<Text style={styles.emptyText}>All your print jobs have been completed</Text>
						</View>
					) : (
						<View style={styles.activeJobsList}>
							{activeJobs.map((job) => (
								<ActiveJobCard
									key={job.id}
									job={job}
									onPress={() =>
										router.push({ pathname: "/transaction-details", params: { transaction: JSON.stringify(job) } })
									}
								/>
							))}
						</View>
					)
				) : allJobs.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Feather name="inbox" size={48} color={colors.textSecondary} />
						<Text style={styles.emptyTitle}>No Jobs Yet</Text>
						<Text style={styles.emptyText}>Your print jobs will appear here</Text>
					</View>
				) : (
					<TransactionList
						transactions={allJobs}
						onTransactionPress={(t) =>
							router.push({ pathname: "/transaction-details", params: { transaction: JSON.stringify(t) } })
						}
					/>
				)}
			</ScrollView>
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
		justifyContent: "center",
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
	segmentedControlContainer: {
		backgroundColor: colors.cardBackground,
		paddingHorizontal: 20,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderLight,
	},
	segmentedControl: {
		flexDirection: "row",
		backgroundColor: colors.background,
		borderRadius: 12,
		padding: 4,
	},
	segmentButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 10,
		borderRadius: 10,
		gap: 6,
	},
	segmentButtonActive: {
		backgroundColor: colors.cardBackground,
		shadowColor: colors.shadowMedium,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 1,
		shadowRadius: 4,
		elevation: 2,
	},
	segmentText: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.textSecondary,
	},
	segmentTextActive: {
		color: colors.textPrimary,
	},
	segmentBadge: {
		backgroundColor: colors.textSecondary,
		minWidth: 20,
		height: 20,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 6,
	},
	segmentBadgeActive: {
		backgroundColor: colors.creditWallet,
	},
	segmentBadgeText: {
		fontSize: 11,
		fontWeight: "700",
		color: colors.cardBackground,
	},
	segmentBadgeTextActive: {
		color: colors.cardBackground,
	},
	scrollView: {
		flex: 1,
		backgroundColor: colors.cardBackground,
	},
	scrollContent: {
		padding: 20,
		flexGrow: 1,
	},
	activeJobsList: {
		gap: 0,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 12,
	},
	loadingText: {
		fontSize: 14,
		color: colors.textSecondary,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		gap: 16,
	},
	errorText: {
		fontSize: 16,
		color: colors.textSecondary,
		textAlign: "center",
	},
	retryButton: {
		backgroundColor: colors.primary,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 12,
	},
	retryButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.cardBackground,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
		gap: 12,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: colors.textPrimary,
	},
	emptyText: {
		fontSize: 14,
		color: colors.textSecondary,
		textAlign: "center",
	},
});

export default Jobs;
