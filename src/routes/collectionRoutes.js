import express from "express";
import { recordCollection, listCollections } from "../controllers/collectionController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Staff records a collection by binId
router.post("/record", authorize("staff"), recordCollection);

// List collections by role scope
router.get("/", authorize("admin", "staff", "resident"), listCollections);

export default router;
