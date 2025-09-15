const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
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
