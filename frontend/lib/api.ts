import { getAuth } from "firebase/auth";

// Use environment variable or fallback for local development
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";
interface ApiOptions {
  method?: string;
  body?: any;
}

interface ApiRequestOptions extends ApiOptions {
  onUnauthorized?: () => void;
}

export async function apiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    const isAuthEndpoint =
      endpoint.startsWith("/auth") ||
      endpoint === "/auth/login" ||
      endpoint === "/auth/register";

    let token: string | null = null;

    if (user && !isAuthEndpoint) {
      // Get a fresh ID token from Firebase. This handles expiration automatically.
      try {
        token = await user.getIdToken();``
      } catch (tokenError) {
        console.error("Failed to get ID token:", tokenError);
        // If token fetch fails, the user session is likely invalid
        if (options.onUnauthorized) {
          options.onUnauthorized();
        }
        throw new Error("User session invalid. Please log in again.");
      }
    } else if (!isAuthEndpoint) {
      // If no Firebase user and it's not an auth endpoint, the user is not authenticated.
      throw new Error("User not authenticated.");
    }

    const { method = "GET", body } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      // Only attach Authorization header when a token exists
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle HTTP error responses
    if (!response.ok) {
      if (response.status === 401) {
        if (options.onUnauthorized) {
          options.onUnauthorized();
        }
        throw new Error("Your session has expired. Please log in again.");
      }

      let errorMessage: string;
      const responseClone = response.clone();
      try {
        const errorData = await responseClone.json();
        errorMessage =
          errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        errorMessage = await response.text();
      }

      switch (response.status) {
        case 400:
          throw new Error(`Invalid request: ${errorMessage}`);
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

    // Attempt to parse JSON, handle cases where response is empty or not JSON
    try {
      return await response.json();
    } catch (parseError) {
      // If parsing fails, it might be a successful response with no body (e.g., 204 No Content)
      return null;
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your internet connection.");
    } else if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
}

// Posts API
export const postsApi = {
  getAllPosts: (onUnauthorized?: () => void) =>
    apiRequest("/posts", { onUnauthorized }),
  createPost: (
    data: {
      description: string;
      location: string;
      image: string | undefined;
      hashtags: string;
    },
    onUnauthorized?: () => void
  ) => apiRequest("/posts", { method: "POST", body: data, onUnauthorized }),

  updatePost: (
    postId: string,
    data: {
      description?: string;
      location?: string;
      image?: string;
      hashtags?: string[];
    }
  ) => apiRequest(`/posts/${postId}`, { method: "PUT", body: data }),

  deletePost: (postId: string) =>
    apiRequest(`/posts/${postId}`, { method: "DELETE" }),

  likePost: (postId: string) =>
    apiRequest(`/posts/${postId}/like`, { method: "POST" }),
};

// Profile API
export const profileApi = {
  getProfile: (onUnauthorized?: () => void) =>
    apiRequest("/profile", { onUnauthorized }),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    apiRequest("/profile", { method: "PUT", body: data }),
};

// Rewards API
export const rewardsApi = {
  getRewards: () => apiRequest("/rewards"),

  claimReward: (rewardId: string) =>
    apiRequest(`/rewards/${rewardId}/claim`, { method: "POST" }),
};
