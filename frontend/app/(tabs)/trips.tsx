import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { MapPin, Navigation } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TripsScreen() {
    const [activeTrip] = useState(true);
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Trip Logging</Text>
            </View>

            <ScrollView style={styles.content}>
                {activeTrip && (
                    <View style={styles.activeTripCard}>
                        <View style={styles.tripHeader}>
                            <Text style={styles.tripTitle}>Journey in Progress</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Active</Text>
                            </View>
                        </View>

                        <View style={styles.mapPlaceholder}>
                            <MapPin color="#22c55e" size={48} />
                            <Text style={styles.mapText}>Interactive Map View</Text>
                            <Text style={styles.mapSubtext}>Track your journey in real-time</Text>
                        </View>

                        <View style={styles.tripStats}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Distance</Text>
                                <Text style={styles.statValue}>12.5 km</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Points</Text>
                                <Text style={styles.statValue}>250</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Duration</Text>
                                <Text style={styles.statValue}>2h 15m</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.endTripButton}>
                            <Text style={styles.endTripText}>End Trip</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.suggestedSection}>
                    <Text style={styles.sectionTitle}>Suggested Destinations</Text>

                    <View style={styles.destinationCard}>
                        <View style={styles.destinationInfo}>
                            <Text style={styles.destinationName}>India Gate</Text>
                            <Text style={styles.destinationDesc}>Historical arch</Text>
                            <View style={styles.destinationMeta}>
                                <Navigation color="#22c55e" size={16} />
                                <Text style={styles.destinationDistance}>2.3 km away</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.directionsButton}>
                            <Text style={styles.directionsText}>Directions</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.destinationCard}>
                        <View style={styles.destinationInfo}>
                            <Text style={styles.destinationName}>Lotus Temple</Text>
                            <Text style={styles.destinationDesc}>House of Worship</Text>
                            <View style={styles.destinationMeta}>
                                <Navigation color="#22c55e" size={16} />
                                <Text style={styles.destinationDistance}>5.7 km away</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.directionsButton}>
                            <Text style={styles.directionsText}>Directions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.startTripButton}>
                    <Text style={styles.startTripText}>Start New Trip</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#374151",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#ffffff",
        textAlign: "center",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    activeTripCard: {
        backgroundColor: "#1f2937",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    tripHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    tripTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    statusBadge: {
        backgroundColor: "#22c55e",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#ffffff",
    },
    mapPlaceholder: {
        backgroundColor: "#374151",
        borderRadius: 12,
        padding: 40,
        alignItems: "center",
        marginBottom: 20,
    },
    mapText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        marginTop: 12,
    },
    mapSubtext: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 4,
    },
    tripStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statItem: {
        alignItems: "center",
    },
    statLabel: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    endTripButton: {
        backgroundColor: "#22c55e",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    endTripText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    suggestedSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 16,
    },
    destinationCard: {
        backgroundColor: "#1f2937",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    destinationInfo: {
        flex: 1,
    },
    destinationName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 4,
    },
    destinationDesc: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8,
    },
    destinationMeta: {
        flexDirection: "row",
        alignItems: "center",
    },
    destinationDistance: {
        fontSize: 14,
        color: "#22c55e",
        marginLeft: 6,
    },
    directionsButton: {
        backgroundColor: "#374151",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    directionsText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#ffffff",
    },
    startTripButton: {
        backgroundColor: "#22c55e",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 20,
    },
    startTripText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
});