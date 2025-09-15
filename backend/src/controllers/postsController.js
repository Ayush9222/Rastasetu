const Post = require("../models/Post");

exports.createPost = async (req, res) => {
  try {
    const { title, body, images, location } = req.body;
    const post = new Post({ user: req.userId, title, body, images, location });
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPosts = async (req, res) => {
  try {
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
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.user.toString() !== req.userId)
      return res.status(403).json({ message: "Forbidden" });

    Object.assign(post, req.body);
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
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.user.toString() !== req.userId)
      return res.status(403).json({ message: "Forbidden" });

    await post.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
