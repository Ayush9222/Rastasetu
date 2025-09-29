const express = require("express");
const router = express.Router();
const { createOrUpdateUser } = require("../controllers/authController");
const { getProfile } = require("../controllers/profileController");
const { verifyAuthToken } = require("../middleware/auth");

// This endpoint is called after successful Firebase authentication
// to create/update the user profile in our database
router.post("/user", verifyAuthToken, createOrUpdateUser);

// Get user profile (protected route)
router.get("/user", verifyAuthToken, getProfile);

module.exports = router;
