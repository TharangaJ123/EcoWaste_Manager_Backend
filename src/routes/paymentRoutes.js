import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { listPayments, getByRequest } from "../controllers/paymentController.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin", "resident"), listPayments);
router.get("/by-request/:id", authorize("admin", "resident"), getByRequest);

export default router;
