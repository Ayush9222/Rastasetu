const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String },
    images: { type: [String], default: [] },
    location: { type: String },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
