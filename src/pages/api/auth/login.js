import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import connectDb from "../../../app/backend/DB/db.js";
import User from "../../../app/backend/models/auth_model";

export default async function handler(req, res) {
  // Connect to the database
  await connectDb();

  if (req.method === "POST") {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    try {
      const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });
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

      // Generate token directly in login.js
      const generateToken = (userId) => {
        try {
          return jwt.sign(
            { userID: userId.toString() },
            process.env.JWT_SECRET_KEY || "fallback-secret-key",
            { expiresIn: "1h" }
          );
        } catch (error) {
          console.error("Error generating token:", error);
          return null;
        }
      };

      const token = generateToken(user._id);
      if (!token) {
        return res.status(500).json({ message: "Failed to generate token" });
      }

      // Remove password from the user object before returning it
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
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}