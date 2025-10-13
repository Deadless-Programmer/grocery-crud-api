export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (user.role !== requiredRole && user.role !== "admin") {
      // admin সবকিছু করতে পারবে
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};