import bcrypt from "bcrypt";
import connectDb from "../../../app/backend/DB/db.js";
import User from "../../../app/backend/models/auth_model";

export default async function handler(req, res) {
  // Connect to the database
  await connectDb();
  if (req.method === "POST") {
    const { name, email, password, phoneNo,} = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    try {
      const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });
      if (user) {
        return res
          .status(400)
          .json({ message: "Email already exist" });
      }
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create a new user
      const newUser = new User({
        name,
        email,
        phoneNo,
        password: hashedPassword,
      });
      await newUser.save();
 
    } catch (error) {
      console.error("Error in signup:", error);
      res.status(500).json({ error: "Server error", details: error.message });
  
    }
 
    return res.status(200).json({ message: "Signup successful!" });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
