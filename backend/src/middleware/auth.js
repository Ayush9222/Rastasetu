const admin = require("../config/firebase-admin");

/**
 * Middleware to verify Firebase ID tokens and attach the decoded user to the request
 */
const verifyAuthToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided. Format: Authorization: Bearer <token>",
    });
  }

  // Extract the token
  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach the verified user data to the request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      picture: decodedToken.picture || decodedToken.photoURL || null,
    };
    req.userId = decodedToken.uid; // For compatibility with existing controllers

    next();
  } catch (error) {
    console.error("Token verification failed:", error);

    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ message: "Token has expired. Please sign in again." });
    }

    return res
      .status(401)
      .json({ message: "Invalid token. Please sign in again." });
  }
};

/**
 * Optional middleware to ensure email is verified
 * Use this for routes that require verified emails
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user?.email_verified) {
    return res.status(403).json({
      message: "Email verification required. Please verify your email address.",
    });
  }
  next();
};

module.exports = {
  verifyAuthToken,
  requireEmailVerified,
};
