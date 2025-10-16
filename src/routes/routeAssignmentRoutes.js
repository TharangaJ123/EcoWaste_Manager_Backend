import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { createAssignment, listAssignments, updateStatus, deleteAssignment, startRoute, togglePickupPoint, listAreas, listStaff, listUnassignedSpecialPickups, addPickupPoints, listAreaPickupPoints } from "../controllers/routeAssignmentController.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("admin"), createAssignment);
router.get("/", authorize("admin", "staff"), listAssignments);
router.patch("/:id/status", authorize("admin", "staff"), updateStatus);
router.delete("/:id", authorize("admin"), deleteAssignment);
router.patch("/:id/start", authorize("admin", "staff"), startRoute);
router.patch("/:id/pickups/:index", authorize("admin", "staff"), togglePickupPoint);
router.patch("/:id/pickups", authorize("admin"), addPickupPoints);

router.get("/areas", authorize("admin"), listAreas);
router.get("/area-pickups", authorize("admin"), listAreaPickupPoints);
router.get("/staff", authorize("admin"), listStaff);
router.get("/special-pickups", authorize("admin"), listUnassignedSpecialPickups);

export default router;
