import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential,
  updateProfile,
} from "firebase/auth";

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

    useEffect(() => {
      console.log("Setting up auth state listener");
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log(
          "Auth state changed:",
          firebaseUser ? "User logged in" : "No user"
        );
        setIsLoading(true);
        if (firebaseUser) {
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatar: firebaseUser.photoURL || undefined,
            points: 0,
            badges: [],
            tripsCompleted: 0,
          };

          // Load user data from AsyncStorage
          try {
            const storedData = await AsyncStorage.getItem(
              `userData_${firebaseUser.uid}`
            );
            if (storedData) {
              const { points, badges, tripsCompleted } = JSON.parse(storedData);
              userData.points = points;
              userData.badges = badges;
              userData.tripsCompleted = tripsCompleted;
            }
          } catch (error) {
            console.error("Error loading user data:", error);
          }

          setUser(userData);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
      try {
        const userCredential: UserCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const { user: firebaseUser } = userCredential;

        // Load or initialize user data
        let userData = {
          points: 0,
          badges: [],
          tripsCompleted: 0,
        };

        try {
          const storedData = await AsyncStorage.getItem(
            `userData_${firebaseUser.uid}`
          );
          if (storedData) {
            userData = JSON.parse(storedData);
          } else {
            // Initialize new user data
            await AsyncStorage.setItem(
              `userData_${firebaseUser.uid}`,
              JSON.stringify(userData)
            );
          }
        } catch (error) {
          console.error("Error handling user data:", error);
        }

        // Set local user state and navigate immediately to home
        const localUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatar: firebaseUser.photoURL || undefined,
          points: userData.points,
          badges: userData.badges,
          tripsCompleted: userData.tripsCompleted,
        };

        setUser(localUser);
        router.replace("/(tabs)/home");
      } catch (error: any) {
        console.error("Login error:", error);
        throw new Error(error.message || "Login failed");
      }
    };

    const register = async (email: string, password: string, name: string) => {
      try {
        const userCredential: UserCredential =
          await createUserWithEmailAndPassword(auth, email, password);
        const { user: firebaseUser } = userCredential;

        // Update profile with name
        await updateProfile(firebaseUser, { displayName: name });

        // Initialize user data
        const userData = {
          points: 0,
          badges: [],
          tripsCompleted: 0,
        };

        await AsyncStorage.setItem(
          `userData_${firebaseUser.uid}`,
          JSON.stringify(userData)
        );
        // Set local user state and navigate immediately to home
        const localUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: name,
          avatar: firebaseUser.photoURL || undefined,
          points: userData.points,
          badges: userData.badges,
          tripsCompleted: userData.tripsCompleted,
        };

        setUser(localUser);
        router.replace("/(tabs)/home");
      } catch (error: any) {
        console.error("Registration error:", error);
        throw new Error(error.message || "Registration failed");
      }
    };

    const logout = async () => {
      try {
        await signOut(auth);
        // Clear user state immediately
        setUser(null);
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
      login,
      register,
      logout,
    };
  }
);
