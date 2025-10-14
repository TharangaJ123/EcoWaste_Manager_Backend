import express from "express";
import {
  createRequest,
  listRequests,
  getRequest,
  approveRequest,
  assignStaff,
  updateStatus,
} from "../controllers/specialPickupController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("resident"), createRequest);

router.get("/", authorize("resident", "staff", "admin"), listRequests);

router.get("/:id", authorize("resident", "staff", "admin"), getRequest);

router.patch("/:id/approve", authorize("admin"), approveRequest);

router.patch("/:id/assign", authorize("admin"), assignStaff);

router.patch("/:id/status", authorize("admin", "staff"), updateStatus);

export default router;
