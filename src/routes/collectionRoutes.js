import express from "express";
import { recordCollection, listCollections } from "../controllers/collectionController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/record", authorize("staff"), recordCollection);

router.get("/", authorize("admin", "staff", "resident"), listCollections);

export default router;
