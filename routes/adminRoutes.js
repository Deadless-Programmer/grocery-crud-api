import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// ✅ সব user list (admin/moderator দেখবে)
router.get("/users", verifyToken, requireRole("moderator"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ user role update (only admin)
router.put("/users/:id/role", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ["user", "moderator", "admin"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ user delete (only admin)
router.delete("/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
