const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "development-secret-key";

if (!process.env.JWT_SECRET) {
  console.warn(
    "WARNING: JWT_SECRET not set in environment variables. Using unsafe default secret."
  );
}

// New registration function that accepts firebaseUid
exports.register = async (req, res) => {
  try {
    const { email, password, name, firebaseUid } = req.body;
    if (!email || !password || !name || !firebaseUid) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = new User({ email, password, name, firebaseUid });
    await user.save();

    const token = jwt.sign({ id: user.firebaseUid }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user.firebaseUid, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Updated login function to sign JWT with firebaseUid
exports.login = async (req, res) => {
  try {
    const { email, password, firebaseUid } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // First try to find user by firebaseUid if provided
    let user = firebaseUid ? await User.findOne({ firebaseUid }) : null;

    // If no user found by firebaseUid, try email
    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Only verify password if user wasn't found by firebaseUid
    if (!firebaseUid) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    const token = jwt.sign({ id: user.firebaseUid }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user.firebaseUid,
        email: user.email,
        name: user.name,
        points: user.points,
        badges: user.badges,
        tripsCompleted: user.tripsCompleted,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create or update user based on Firebase token information
exports.createOrUpdateUser = async (req, res) => {
  try {
    // Expecting req.userId to be set by middleware
    const firebaseUid = req.userId || (req.user && req.user.uid);
    if (!firebaseUid)
      return res.status(400).json({ message: "Missing firebase uid" });

    const { name, avatar } = req.body;

    let user = await User.findOne({ firebaseUid });
    if (user) {
      // Update fields if provided
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      await user.save();
    } else {
      // Create a new user record with minimal fields
      user = new User({
        firebaseUid,
        name: name || undefined,
        avatar: avatar || undefined,
      });
      await user.save();
    }

    res.json({
      user: {
        id: user.firebaseUid,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        points: user.points,
        badges: user.badges,
        tripsCompleted: user.tripsCompleted,
      },
    });
  } catch (err) {
    console.error("createOrUpdateUser error", err);
    res.status(500).json({ message: "Server error" });
  }
};
