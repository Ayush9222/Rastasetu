// backend/src/controllers/postsController.js
const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// Helper function to upload base64 image to Cloudinary
const uploadToCloudinary = async (base64Image) => {
  try {
    // Check if image is already a URL (in case of updates where image hasn't changed)
    if (
      base64Image.startsWith("http://") ||
      base64Image.startsWith("https://")
    ) {
      return base64Image;
    }

    // Add data URI prefix if not present
    const base64Data = base64Image.startsWith("data:image")
      ? base64Image
      : `data:image/jpeg;base64,${base64Image}`;

    // Upload to Cloudinary with optimizations
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
    // Only delete if it's a Cloudinary URL
    if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
      return;
    }

    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/public_id.jpg
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) return;

    // Get everything after 'upload/v123456/'
    const publicIdWithFolder = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithFolder.split(".")[0]; // Remove extension

    await cloudinary.uploader.destroy(publicId);
    console.log("Deleted image from Cloudinary:", publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    // Don't throw error - deletion failure shouldn't break the request
  }
};

exports.createPost = async (req, res) => {
  try {
    const { image, description, hashtags, location } = req.body;

    // Find the user document by Firebase UID
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate required fields
    if (!description || !description.trim()) {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        message: "Location is required",
      });
    }

    if (!hashtags || !hashtags.trim()) {
      return res.status(400).json({
        message: "Hashtags are required",
      });
    }

    if (!image) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    // Upload image to Cloudinary
    console.log("Uploading image to Cloudinary...");
    const imageUrl = await uploadToCloudinary(image);
    console.log("Image uploaded successfully:", imageUrl);

    // Create post with Cloudinary URL
    const post = new Post({
      user: user._id,
      image: imageUrl,
      description: description.trim(),
      hashtags: hashtags.trim(),
      location: location.trim(),
    });

    await post.save();

    // Populate user details before sending response
    await post.populate("user", "name email avatar");

    console.log("Post created successfully:", post._id);
    res.status(201).json(post);
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
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "name email avatar")
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("Get post error:", err);

    // Handle invalid ObjectId
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

    // Find the user document by Firebase UID
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check ownership
    if (post.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this post" });
    }

    // Update image if provided and different from current
    if (image && image !== post.image) {
      console.log("Updating post image...");

      // Upload new image to Cloudinary
      const newImageUrl = await uploadToCloudinary(image);

      // Delete old image from Cloudinary (after successful upload)
      if (post.image) {
        await deleteFromCloudinary(post.image);
      }

      post.image = newImageUrl;
      console.log("Image updated successfully");
    }

    // Update other fields if provided
    if (description) post.description = description.trim();
    if (hashtags) post.hashtags = hashtags.trim();
    if (location) post.location = location.trim();

    await post.save();
    await post.populate("user", "name email avatar");

    console.log("Post updated successfully:", post._id);
    res.json(post);
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

    // Find the user document by Firebase UID
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check ownership
    if (post.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this post" });
    }

    // Delete image from Cloudinary
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
