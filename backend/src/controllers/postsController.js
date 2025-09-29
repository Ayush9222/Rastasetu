const Post = require("../models/Post"); // Ensure the correct path
const User = require("../models/User"); // You'll need this to populate user details

exports.createPost = async (req, res) => {
  try {
    // The request body should contain these fields, matching the schema
    const { image, description, hashtags, location } = req.body;

    const post = new Post({
      user: req.userId,
      image,
      description,
      hashtags,
      location,
    });

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    // Populate the 'user' field to include the user's name, email, and avatar
    const posts = await Post.find().populate("user", "name email avatar");

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "user",
      "name email avatar"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { description, hashtags, location } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Convert ObjectId to string for comparison
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Use a simpler approach to update specific fields
    post.description = description || post.description;
    post.hashtags = hashtags || post.hashtags;
    post.location = location || post.location;

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await post.deleteOne();
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
