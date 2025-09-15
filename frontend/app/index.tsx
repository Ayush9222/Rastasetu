import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { theme } from "@/constants/theme";

export default function Index() {
  const { user, isLoading } = useAuth();

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Once loaded, redirect based on auth state
  return <Redirect href={user ? "/(tabs)/home" : "/(auth)/login"} />;
}
