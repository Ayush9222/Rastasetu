import { auth } from "../config/firebase";

const API_URL = "http://localhost:5000/api";

interface ApiOptions {
  method?: string;
  body?: any;
}

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  try {
    const user = auth.currentUser;
    const userId = user?.uid;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { method = "GET", body } = options;

    const headers = {
      "Content-Type": "application/json",
      "x-user-id": userId,
    };

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle HTTP error responses
    if (!response.ok) {
      let errorMessage: string;
      const responseClone = response.clone();
      try {
        // Try to parse error response as JSON
        const errorData = await responseClone.json();
        errorMessage =
          errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        // Fallback to text if not JSON
        errorMessage = await response.text();
      }

      // Map common HTTP status codes to user-friendly messages
      switch (response.status) {
        case 400:
          throw new Error(`Invalid request: ${errorMessage}`);
        case 401:
          throw new Error("Your session has expired. Please log in again.");
        case 403:
          throw new Error("You don't have permission to perform this action.");
        case 404:
          throw new Error(`The requested resource was not found: ${endpoint}`);
        case 413:
          throw new Error("The file you're trying to upload is too large.");
        case 429:
          throw new Error("Too many requests. Please try again later.");
        case 500:
          throw new Error(
            "An unexpected server error occurred. Please try again later."
          );
        default:
          throw new Error(`Request failed: ${errorMessage}`);
      }
    }

    return response.json();
  } catch (error) {
    // Handle network errors and timeouts
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your internet connection.");
    } else if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    } else if (error instanceof Error) {
      // Re-throw the error with its original message
      throw error;
    } else {
      // Handle unknown errors
      throw new Error("An unexpected error occurred.");
    }
  }
}

// Posts API
export const postsApi = {
  getAllPosts: () => apiRequest("/posts"),

  createPost: (data: {
    title: string;
    body: string;
    location: string;
    image?: string; // Changed from images array to single image
  }) => apiRequest("/posts", { method: "POST", body: data }),

  updatePost: (postId: string, data: any) =>
    apiRequest(`/posts/${postId}`, { method: "PUT", body: data }),

  deletePost: (postId: string) =>
    apiRequest(`/posts/${postId}`, { method: "DELETE" }),

  likePost: (postId: string) =>
    apiRequest(`/posts/${postId}/like`, { method: "POST" }),
};

// Profile API
export const profileApi = {
  getProfile: () => apiRequest("/profile"),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    apiRequest("/profile", { method: "PUT", body: data }),
};

// Rewards API
export const rewardsApi = {
  getRewards: () => apiRequest("/rewards"),

  claimReward: (rewardId: string) =>
    apiRequest(`/rewards/${rewardId}/claim`, { method: "POST" }),
};
