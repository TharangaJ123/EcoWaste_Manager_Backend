import express from "express";
import { listUsers, getUser, updateUser, deleteUser } from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", listUsers);
router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
