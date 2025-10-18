import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import dotenv from "dotenv";
import { verifyToken } from "../middleware/auth.js";
dotenv.config();

const router = express.Router();



// ========================== LOGIN ==========================


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    // console.log("user:", user)
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // create token payload (avoid sending password)
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,name: user.name,
    };

    // short-lived access token
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m", // 15 minutes
    });

    // long-lived refresh token
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d", // 7 days
    });


   res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // https এ true
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
   console.log("Refresh token cookie set");




    

    // respond with token and safe user info
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.json({
      message: "Login successful",
      accessToken,
     
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




router.get("/me", verifyToken, async (req, res) => {
  try {
    
    const user = req.user; // token verify থেকে আসছে
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ========================== REFRESH TOKEN ==========================


// router.post("/refresh", (req, res) => {
//   const { token } = req.body;
//   if (!token)
//     return res.status(401).json({ message: "No refresh token provided" });

//   jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: "Invalid refresh token" });

//     const newAccessToken = jwt.sign(
//       { id: user.id, email: user.email , role: user.role},
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" } // new short-lived token
//     );

//     res.json({ accessToken: newAccessToken });
//   });
// });

// ========================== REFRESH TOKEN ==========================
router.post("/refresh", (req, res) => {
  // 🔹 Browser automatically cookie পাঠাবে
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token provided" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  });
});


router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", { httpOnly: true, path: "/" });
  res.json({ message: "Logged out" });
});






export default router;
