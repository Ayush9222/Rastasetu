require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
// const MONGO_URI = process.env.MONGO_URI;
const postsRoutes = require("./routes/posts");
const profileRoutes = require("./routes/profile");

const app = express();
mongoose
  .connect(
    "mongodb+srv://shaikhmohammadhassan027_db_user:a7vGTJJhYqgcLvSx@tourismappcluster.apsfbah.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
  });

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
app.use("/api/posts", postsRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
