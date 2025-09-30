const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const postsRoutes = require("./routes/posts");
const profileRoutes = require("./routes/profile");
const authRoutes = require("./routes/auth");
const { verifyAuthToken } = require("./middleware/auth");

const app = express();

const PORT = process.env.PORT || 5000;

// Register middleware and routes before starting the server
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(","),
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
// Public routes
app.use("/api/auth", authRoutes);

// Protected routes - require valid Firebase token
app.use("/api/posts", verifyAuthToken, postsRoutes);
app.use("/api/profile", verifyAuthToken, profileRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
  });

module.exports = app;
