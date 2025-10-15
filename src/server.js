import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from 'cors';
import userRoutes from "./routes/userRoutes.js";
import specialPickupRoutes from "./routes/specialPickupRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import binsRoutes from "./routes/binsRoutes.js";
import routeAssignmentRoutes from "./routes/routeAssignmentRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/special-pickups", specialPickupRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/bins", binsRoutes);
app.use("/api/route-assignments", routeAssignmentRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
