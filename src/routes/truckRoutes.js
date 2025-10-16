import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { createTruck, listTrucks, listAvailableStaff, assignStaff, todaySummary } from "../controllers/truckController.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("admin"), createTruck);
router.get("/", authorize("admin"), listTrucks);
router.get("/available-staff", authorize("admin"), listAvailableStaff);
router.patch("/:id/assign", authorize("admin"), assignStaff);
router.get("/summary/today", authorize("admin"), todaySummary);

export default router;
