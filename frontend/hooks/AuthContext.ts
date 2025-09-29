import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  getIdToken,
} from "firebase/auth";
import { apiRequest } from "@/lib/api";

interface User {
  id: string;
  email: string | null;
  name: string | null;
  avatar?: string;
  points: number;
  badges: string[];
  tripsCompleted: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(
  () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    const syncUserWithBackend = useCallback(async (firebaseUser: any) => {
      try {
        // Get fresh ID token
        const idToken = await getIdToken(firebaseUser, true);
        await AsyncStorage.setItem("firebaseToken", idToken);

        // Sync with backend
        const backendResponse = await apiRequest("/auth/user", {
          method: "POST",
          body: {
            name: firebaseUser.displayName,
            avatar: firebaseUser.photoURL,
          },
        });

        // Update local user state with merged data
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: backendResponse.user.name || firebaseUser.displayName,
          avatar: backendResponse.user.avatar || firebaseUser.photoURL,
          points: backendResponse.user.points,
          badges: backendResponse.user.badges,
          tripsCompleted: backendResponse.user.tripsCompleted,
        };

        setUser(userData);
        setAuthError(null);
      } catch (error) {
        console.error("Error syncing with backend:", error);
        setAuthError("Error syncing user data");
      }
    }, []);

    useEffect(() => {
      console.log("Setting up auth state listener");
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setIsLoading(true);
        try {
          if (firebaseUser) {
            await syncUserWithBackend(firebaseUser);
          } else {
            setUser(null);
            await AsyncStorage.removeItem("firebaseToken");
          }
        } catch (error) {
          console.error("Auth state change error:", error);
          setAuthError("Authentication error");
        } finally {
          setIsLoading(false);
        }
      });

      return () => unsubscribe();
    }, [syncUserWithBackend]);

    const login = async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Authenticate with Firebase
        await signInWithEmailAndPassword(auth, email, password);

        // Token and backend sync handled by onAuthStateChanged listener
        router.replace("/(tabs)/home");
      } catch (error: any) {
        console.error("Login error:", error);
        setAuthError(error.message || "Login failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    };

    const register = async (email: string, password: string, name: string) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Create Firebase user
        const { user: firebaseUser } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Update profile with name
        await updateProfile(firebaseUser, { displayName: name });

        // Token and backend sync handled by onAuthStateChanged listener
        router.replace("/(tabs)/home");
      } catch (error: any) {
        console.error("Registration error:", error);
        setAuthError(error.message || "Registration failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    };

    const logout = async () => {
      try {
        await signOut(auth);
        // Clear user state and stored token immediately
        setUser(null);
        await AsyncStorage.removeItem("token");
        // Navigate to login immediately instead of waiting for onAuthStateChanged
        router.replace("/(auth)/login");
      } catch (error) {
        console.error("Logout failed:", error);
        throw error;
      }
    };

    return {
      user,
      isLoading,
      authError,
      login,
      register,
      logout,
    };
  }
);
