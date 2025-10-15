import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { listBins, addWeight, lookupByBinId } from "../controllers/binsController.js";

const router = express.Router();

router.use(protect);
router.get("/", authorize("admin", "staff", "resident"), listBins);
router.get("/lookup", authorize("admin", "staff", "resident"), lookupByBinId);
router.patch( 
  "/:id/add-weight",
  authorize("admin", "staff", "resident"),
  addWeight
);

export default router;
