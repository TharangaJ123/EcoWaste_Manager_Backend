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

// Resident creates request
router.post("/", authorize("resident"), createRequest);

// List requests (resident sees own, staff sees assigned, admin sees all)
router.get("/", authorize("resident", "staff", "admin"), listRequests);

// Get one request
router.get("/:id", authorize("resident", "staff", "admin"), getRequest);

// Admin approve/reject
router.patch("/:id/approve", authorize("admin"), approveRequest);

// Admin assign staff
router.patch("/:id/assign", authorize("admin"), assignStaff);

// Admin or Staff update status (controller enforces specific rules)
router.patch("/:id/status", authorize("admin", "staff"), updateStatus);

export default router;
