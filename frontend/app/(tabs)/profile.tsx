import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Award,
  MapPin,
  LogIn,
} from "lucide-react-native";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/AuthContext";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { stats } = useUserProfile();
  const insets = useSafeAreaInsets();
  const { logout, user, isLoading } = useAuth();

  // Only show loading state during initial load
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  const menuItems = [
    { icon: Bell, title: "Notifications", hasChevron: true },
    { icon: Shield, title: "Privacy", hasChevron: true },
    { icon: HelpCircle, title: "Help", hasChevron: true },
    { icon: Info, title: "About", hasChevron: true },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "An unexpected error occurred";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Settings color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <Image source={{ uri: user?.avatar }} style={styles.profileImage} />
          <Text style={styles.userName}>{user?.name}</Text>
          {/* <Text style={styles.userJoined}>Joined {user?.joinedYear}</Text> */}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.trips}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.badges}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Award color="#ffffff" size={20} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Explorer</Text>
              <Text style={styles.achievementDesc}>
                Completed 5 different states
              </Text>
            </View>
            <Text style={styles.achievementDate}>2 days ago</Text>
          </View>

          <View style={styles.achievementCard}>
            <View
              style={[styles.achievementIcon, { backgroundColor: "#3b82f6" }]}
            >
              <MapPin color="#ffffff" size={20} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>State Hopper</Text>
              <Text style={styles.achievementDesc}>
                Visited 3 different states
              </Text>
            </View>
            <Text style={styles.achievementDate}>1 week ago</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.title} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <item.icon color="#22c55e" size={20} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              {item.hasChevron && <ChevronRight color="#6b7280" size={20} />}
            </TouchableOpacity>
          ))}

          {user ? (
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, styles.logoutIcon]}>
                  <LogOut color="#ef4444" size={20} />
                </View>
                <Text style={[styles.menuItemText, styles.logoutText]}>
                  Log Out
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.menuItem, styles.loginItem]}
              onPress={() => router.push("/(auth)/login")}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, styles.loginIcon]}>
                  <LogIn color="#22c55e" size={20} />
                </View>
                <Text style={[styles.menuItemText, styles.loginText]}>
                  Go to Login
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  userJoined: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  achievementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  achievementCard: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: "#6b7280",
  },
  achievementDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  logoutItem: {
    marginTop: 16,
  },
  logoutIcon: {
    backgroundColor: "#fef2f2",
  },
  logoutText: {
    color: "#ef4444",
  },
  loginItem: {
    marginTop: 16,
  },
  loginIcon: {
    backgroundColor: "#f0fdf4",
  },
  loginText: {
    color: "#22c55e",
  },
});
