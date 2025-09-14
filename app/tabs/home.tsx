import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Modal,
} from "react-native";
import { Heart, MessageCircle, Share, MapPin, Send, RefreshCw } from "lucide-react-native";
import { useTravelPosts, Post, Comment } from "@/hooks/useTravelPosts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
    const { posts, loading, error, likePost, addComment, fetchPosts } = useTravelPosts();
    const insets = useSafeAreaInsets();
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [refreshing, setRefreshing] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const showError = (message: string) => {
        if (!message.trim()) return;
        if (message.length > 200) {
            setErrorMessage("Error message too long");
        } else {
            setErrorMessage(message.trim());
        }
        setShowErrorModal(true);
    };

    const handleLike = async (postId: string) => {
        try {
            await likePost(postId);
        } catch {
            showError("Failed to like post");
        }
    };

    const handleAddComment = async (postId: string) => {
        const commentText = commentTexts[postId]?.trim();
        if (!commentText) return;

        try {
            await addComment(postId, commentText);
            setCommentTexts(prev => ({ ...prev, [postId]: "" }));
        } catch (err) {
            showError(err instanceof Error ? err.message : "Failed to add comment");
        }
    };

    const toggleComments = (postId: string) => {
        setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchPosts();
        } catch (err) {
            console.error("Error refreshing posts:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const renderComment = (comment: Comment) => (
        <View key={comment.id} style={styles.commentContainer}>
            <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
            <View style={styles.commentContent}>
                <Text style={styles.commentUsername}>{comment.userName}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
            </View>
        </View>
    );

    const renderPost = (post: Post) => {
        const isCommentsExpanded = expandedComments.has(post.id);
        const commentText = commentTexts[post.id] || "";

        return (
            <View key={post.id} style={styles.postContainer}>
                <View style={styles.postHeader}>
                    <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>{post.user.name}</Text>
                        <View style={styles.locationContainer}>
                            <MapPin color="#6b7280" size={14} />
                            <Text style={styles.location}>{post.location}</Text>
                        </View>
                    </View>
                    <View style={styles.pointsContainer}>
                        <Text style={styles.points}>{post.user.points}</Text>
                    </View>
                </View>

                <Image source={{ uri: post.image }} style={styles.postImage} />

                <View style={styles.postActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleLike(post.id)}
                        testID={`like-button-${post.id}`}
                    >
                        <Heart
                            color={post.isLiked ? "#ef4444" : "#6b7280"}
                            size={24}
                            fill={post.isLiked ? "#ef4444" : "none"}
                        />
                        <Text style={styles.actionText}>{post.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => toggleComments(post.id)}
                        testID={`comment-button-${post.id}`}
                    >
                        <MessageCircle color="#6b7280" size={24} />
                        <Text style={styles.actionText}>{post.comments.length}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Share color="#6b7280" size={24} />
                    </TouchableOpacity>
                </View>

                <View style={styles.postContent}>
                    <Text style={styles.postDescription}>{post.description}</Text>
                    {post.hashtags && (
                        <Text style={styles.postHashtags}>{post.hashtags}</Text>
                    )}
                </View>

                {isCommentsExpanded && (
                    <View style={styles.commentsSection}>
                        {post.comments.map(renderComment)}

                        <View style={styles.addCommentContainer}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                placeholderTextColor="#6b7280"
                                value={commentText}
                                onChangeText={(text) =>
                                    setCommentTexts(prev => ({ ...prev, [post.id]: text }))
                                }
                                multiline
                                testID={`comment-input-${post.id}`}
                            />
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={() => handleAddComment(post.id)}
                                disabled={!commentText.trim()}
                                testID={`send-comment-${post.id}`}
                            >
                                <Send
                                    color={commentText.trim() ? "#22c55e" : "#6b7280"}
                                    size={20}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    if (loading && posts.length === 0) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#22c55e" />
                <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
        );
    }

    if (error && posts.length === 0) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <Text style={styles.errorText}>Failed to load posts</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>RASTASETU</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw
                        color={refreshing ? "#6b7280" : "#22c55e"}
                        size={20}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView
                style={styles.feed}
                showsVerticalScrollIndicator={false}
            >
                {posts.map(renderPost)}
            </ScrollView>

            <Modal
                visible={showErrorModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowErrorModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Error</Text>
                        <Text style={styles.modalMessage}>{errorMessage}</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowErrorModal(false)}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
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
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff",
        letterSpacing: 2,
        flex: 1,
        textAlign: "center",
    },
    refreshButton: {
        padding: 8,
    },
    feed: {
        flex: 1,
    },
    postContainer: {
        backgroundColor: "#1f2937",
        marginBottom: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        overflow: "hidden",
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    username: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    location: {
        fontSize: 14,
        color: "#6b7280",
        marginLeft: 4,
    },
    pointsContainer: {
        backgroundColor: "#22c55e",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    points: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
    },
    postImage: {
        width: "100%",
        height: 300,
        resizeMode: "cover",
    },
    postActions: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 20,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "500",
    },
    postContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    postDescription: {
        fontSize: 14,
        color: "#d1d5db",
        lineHeight: 20,
        marginBottom: 8,
    },
    postHashtags: {
        fontSize: 14,
        color: "#22c55e",
        fontWeight: "500",
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#d1d5db",
        marginTop: 16,
    },
    errorText: {
        fontSize: 16,
        color: "#ef4444",
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#22c55e",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    commentsSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: "#374151",
    },
    commentContainer: {
        flexDirection: "row",
        marginTop: 12,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    commentContent: {
        flex: 1,
        marginLeft: 12,
    },
    commentUsername: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 2,
    },
    commentText: {
        fontSize: 14,
        color: "#d1d5db",
        lineHeight: 18,
    },
    addCommentContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginTop: 16,
        backgroundColor: "#374151",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    commentInput: {
        flex: 1,
        fontSize: 14,
        color: "#ffffff",
        maxHeight: 80,
        paddingVertical: 4,
    },
    sendButton: {
        marginLeft: 12,
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#1f2937",
        borderRadius: 12,
        padding: 24,
        marginHorizontal: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ef4444",
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 14,
        color: "#d1d5db",
        textAlign: "center",
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: "#22c55e",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    modalButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
    },
});