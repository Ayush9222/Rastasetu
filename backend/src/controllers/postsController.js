const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// Helper function to upload base64 image to Cloudinary
const uploadToCloudinary = async (base64Image) => {
  try {
    if (
      base64Image.startsWith("http://") ||
      base64Image.startsWith("https://")
    ) {
      return base64Image;
    }

    const base64Data = base64Image.startsWith("data:image")
      ? base64Image
      : `data:image/jpeg;base64,${base64Image}`;

    const result = await cloudinary.uploader.upload(base64Data, {
      folder: "travel-posts",
      resource_type: "image",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to cloud storage");
  }
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
      return;
    }

    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) return;

    const publicIdWithFolder = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithFolder.split(".")[0];

    await cloudinary.uploader.destroy(publicId);
    console.log("Deleted image from Cloudinary:", publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

// Helper function to transform post to response format
const transformPostToResponse = (post) => {
  return {
    id: post._id.toString(),
    user: {
      id: post.user._id.toString(),
      name: post.user.name,
      email: post.user.email,
      avatar: post.user.avatar,
      points: post.user.points || 0,
    },
    location: post.location,
    image: post.image,
    description: post.description,
    hashtags: post.hashtags,
    likes: post.likes,
    comments: post.comments.map((comment) => ({
      id: comment._id.toString(),
      userId: comment.userId.toString(),
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      text: comment.text,
      createdAt: comment.createdAt,
    })),
    isLiked: post.isLiked,
    createdAt: post.createdAt,
  };
};

exports.createPost = async (req, res) => {
  try {
    const { image, description, hashtags, location } = req.body;

    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ message: "Location is required" });
    }

    if (!hashtags || !hashtags.trim()) {
      return res.status(400).json({ message: "Hashtags are required" });
    }

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    console.log("Uploading image to Cloudinary...");
    const imageUrl = await uploadToCloudinary(image);
    console.log("Image uploaded successfully:", imageUrl);

    const post = new Post({
      user: user._id,
      image: imageUrl,
      description: description.trim(),
      hashtags: hashtags.trim(),
      location: location.trim(),
    });

    await post.save();
    await post.populate("user", "name email avatar points");

    console.log("Post created successfully:", post._id);
    res.status(201).json(transformPostToResponse(post));
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({
      message: err.message || "Failed to create post. Please try again.",
    });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email avatar points")
      .sort({ createdAt: -1 })
      .lean();

    const transformedPosts = posts.map((post) => ({
      id: post._id.toString(),
      user: {
        id: post.user._id.toString(),
        name: post.user.name,
        email: post.user.email,
        avatar: post.user.avatar,
        points: post.user.points || 0,
      },
      location: post.location,
      image: post.image,
      description: post.description,
      hashtags: post.hashtags,
      likes: post.likes,
      comments: post.comments.map((comment) => ({
        id: comment._id.toString(),
        userId: comment.userId.toString(),
        userName: comment.userName,
        userAvatar: comment.userAvatar,
        text: comment.text,
        createdAt: comment.createdAt,
      })),
      isLiked: post.isLiked,
      createdAt: post.createdAt,
    }));

    res.json(transformedPosts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "name email avatar points")
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(transformPostToResponse(post));
  } catch (err) {
    console.error("Get post error:", err);

    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    res.status(500).json({ message: "Failed to fetch post" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { description, hashtags, location, image } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (post.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this post" });
    }

    if (image && image !== post.image) {
      console.log("Updating post image...");
      const newImageUrl = await uploadToCloudinary(image);

      if (post.image) {
        await deleteFromCloudinary(post.image);
      }

      post.image = newImageUrl;
      console.log("Image updated successfully");
    }

    if (description) post.description = description.trim();
    if (hashtags) post.hashtags = hashtags.trim();
    if (location) post.location = location.trim();

    await post.save();
    await post.populate("user", "name email avatar points");

    console.log("Post updated successfully:", post._id);
    res.json(transformPostToResponse(post));
  } catch (err) {
    console.error("Update post error:", err);

    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    res.status(500).json({
      message: err.message || "Failed to update post",
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (post.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this post" });
    }

    if (post.image) {
      console.log("Deleting image from Cloudinary...");
      await deleteFromCloudinary(post.image);
    }

    await post.deleteOne();

    console.log("Post deleted successfully:", post._id);
    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (err) {
    console.error("Delete post error:", err);

    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    res.status(500).json({ message: "Failed to delete post" });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Toggle like
    post.isLiked = !post.isLiked;
    post.likes = post.isLiked ? post.likes + 1 : post.likes - 1;

    await post.save();

    res.json({
      success: true,
      isLiked: post.isLiked,
      likes: post.likes,
    });
  } catch (err) {
    console.error("Like post error:", err);

    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    res.status(500).json({ message: "Failed to like post" });
  }
};
