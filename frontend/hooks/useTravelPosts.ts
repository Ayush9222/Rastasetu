import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { postsApi } from "../lib/api";

export interface User {
  id: string;
  name: string;
  avatar: string;
  points: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  user: User;
  location: string;
  image: string;
  description: string;
  hashtags: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  createdAt: string;
}

export interface CreatePostData {
  description: string;
  location: string;
  hashtags: string;
  image: string;
}

const mockPosts: Post[] = [
  {
    id: "1",
    user: {
      id: "1",
      name: "Ananya Sharma",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      points: 1250,
    },
    location: "Taj Mahal, Agra",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
    description:
      "Witnessing the majestic Taj Mahal at sunrise was truly an unforgettable experience! ✨ The way the morning light dances on the marble is pure magic.",
    hashtags: "#incredibleindia #travel #tajmahal #sunrise",
    likes: 124,
    comments: [
      {
        id: "c1",
        userId: "2",
        userName: "Rohan Verma",
        userAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        text: "Absolutely stunning! 😍",
        createdAt: "2024-01-15T09:30:00Z",
      },
      {
        id: "c2",
        userId: "3",
        userName: "Priya Patel",
        userAvatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        text: "This is on my bucket list!",
        createdAt: "2024-01-15T10:15:00Z",
      },
    ],
    isLiked: true,
    createdAt: "2024-01-15T08:30:00Z",
  },
  {
    id: "2",
    user: {
      id: "2",
      name: "Rohan Verma",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      points: 890,
    },
    location: "Varanasi, Uttar Pradesh",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
    description:
      "The spiritual vibes of Varanasi during the evening aarti ceremony. The ghats come alive with devotion and ancient traditions. 🕉️",
    hashtags: "#varanasi #spirituality #ganges #aarti",
    likes: 89,
    comments: [],
    isLiked: false,
    createdAt: "2024-01-14T19:45:00Z",
  },
  {
    id: "3",
    user: {
      id: "3",
      name: "Priya Patel",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      points: 1450,
    },
    location: "Kerala Backwaters",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    description:
      "Floating through the serene backwaters of Kerala on a traditional houseboat. Nature's tranquility at its finest! 🛶",
    hashtags: "#kerala #backwaters #houseboat #godsowncountry",
    likes: 156,
    comments: [
      {
        id: "c3",
        userId: "1",
        userName: "Ananya Sharma",
        userAvatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        text: "Kerala is magical! 🌴",
        createdAt: "2024-01-13T15:20:00Z",
      },
    ],
    isLiked: true,
    createdAt: "2024-01-13T14:20:00Z",
  },
];

const currentUser: User = {
  id: "current",
  name: "You",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  points: 750,
};

export const [TravelPostsProvider, useTravelPosts] = createContextHook(() => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching posts from API...");

      const response = await postsApi.getAllPosts();
      const allPosts = response.sort(
        (a: Post, b: Post) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPosts(allPosts);
      console.log(`Loaded ${allPosts.length} posts`);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
      // Fallback to mock data in development
      if (process.env.NODE_ENV === "development") {
        setPosts(mockPosts);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const processImageForUpload = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Convert blob to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            // Get the base64 string without the data URL prefix
            const base64data = reader.result.split(",")[1];
            resolve(base64data);
          } else {
            reject(new Error("Failed to convert image to base64"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error("Failed to process image for upload");
    }
  };

  const createPost = useCallback(async (postData: CreatePostData) => {
    if (
      !postData.description.trim() ||
      !postData.location.trim() ||
      !postData.hashtags.trim()
    ) {
      throw new Error("Description, location, and hashtags are required");
    }

    if (postData.description.length > 500) {
      throw new Error("Description is too long");
    }

    if (postData.hashtags.length > 100) {
      throw new Error("Hashtags are too long");
    }

    try {
      console.log("Creating new post...");

      // Process image before upload
      let base64Image = null;
      if (postData.image) {
        base64Image = await processImageForUpload(postData.image);
      }

      const sanitizedData = {
        title: postData.description.trim().split("\n")[0],
        body: postData.description.trim(),
        location: postData.location.trim(),
        image: base64Image || undefined, // Only include if image exists
        hashtags: postData.hashtags.trim(),
      };

      console.log("Uploading post with processed image...");
      const newPost = await postsApi.createPost(sanitizedData);

      // Update local state
      setPosts((prevPosts) => [newPost, ...prevPosts]);

      console.log("Post created successfully!");
      return newPost;
    } catch (err) {
      console.error("Error creating post:", err);
      throw err;
    }
  }, []);

  const likePost = useCallback(async (postId: string) => {
    try {
      console.log(`Toggling like for post ${postId}`);

      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );

      // Simulate API call - replace with actual API call
      // const response = await fetch(`/api/posts/${postId}/like`, {
      //   method: 'PUT',
      // });
      // if (!response.ok) throw new Error('Failed to like post');

      console.log(`Like toggled for post ${postId}`);
    } catch (err) {
      console.error("Error liking post:", err);
      // Revert optimistic update on error
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes + 1 : post.likes - 1,
              }
            : post
        )
      );
    }
  }, []);

  const addComment = useCallback(
    async (postId: string, commentText: string) => {
      if (!commentText.trim()) {
        throw new Error("Comment cannot be empty");
      }

      if (commentText.length > 200) {
        throw new Error("Comment is too long");
      }

      try {
        const sanitizedText = commentText.trim();
        console.log(`Adding comment to post ${postId}:`, sanitizedText);

        const newComment: Comment = {
          id: Date.now().toString(),
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text: sanitizedText,
          createdAt: new Date().toISOString(),
        };

        // Optimistic update
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...post.comments, newComment],
                }
              : post
          )
        );

        // Simulate API call - replace with actual API call
        // const response = await fetch(`/api/posts/${postId}/comments`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ text: sanitizedText }),
        // });
        // if (!response.ok) throw new Error('Failed to add comment');

        console.log(`Comment added to post ${postId}`);
        return newComment;
      } catch (err) {
        console.error("Error adding comment:", err);
        // Revert optimistic update on error
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments.slice(0, -1),
                }
              : post
          )
        );
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return useMemo(
    () => ({
      posts,
      loading,
      error,
      currentUser,
      fetchPosts,
      createPost,
      likePost,
      addComment,
    }),
    [posts, loading, error, fetchPosts, createPost, likePost, addComment]
  );
});
