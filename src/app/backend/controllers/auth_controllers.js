const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/auth_model");
exports.signUp = async (req, res) => {
  const { email, phoneNo, name, password } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }
    const saltRound = 10;
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRound);

    // Create the user
    const userCreated = await User.create({
      email,
      phoneNo,
      name,

      password: hashedPassword,
    });

    // Generate token
    const token = await userCreated.generateToken();
    if (!token) {
      return res.status(500).json({ message: "Failed to generate token" });
    }

    res.status(201).json({
      msg: userCreated,
      token,
      userId: userCreated._id.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Error ", details: err.message });
  }
};
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });
    // console.log(user);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email or password is incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email or password is incorrect" });
    }

    // Generate token
    const token = await user.generateToken();
    if (!token) {
      return res.status(500).json({ message: "Failed to generate token" });
    }

    user.password = "";
    res.status(201).json({
      msg: "Login successful",
      token,
      user: user,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
// Update Profile Function
exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, email, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res
      .status(500)
      .json({ error: "Error updating profile", details: error.message });
  }
};
