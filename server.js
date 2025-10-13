import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import rateLimit from "express-rate-limit";


dotenv.config();
const app = express();


const allowedOrigins = [
  "http://localhost:5173",     // local dev
  "https://worldholidaysbd.com" // production
];


const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};


// 15 minute এ max 100 request প্রতি IP থেকে
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});



// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);
app.disable("x-powered-by");



// ✅ Example route
app.get("/", (req, res) => {
  res.send("API is secure and running 🚀");
});


// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);


// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error("❌ MongoDB Connection Failed:", err.message));

