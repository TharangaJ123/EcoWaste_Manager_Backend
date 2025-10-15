import PaymentDetail from "../models/PaymentDetail.js";
import { Types } from "mongoose";

export const listPayments = async (req, res) => {
  try {
    const { resident } = req.query;
    const filter = {};
    if (resident) {
      if (!Types.ObjectId.isValid(resident)) return res.status(400).json({ message: "Invalid resident" });
      filter.resident = resident;
    }
    if (!resident && req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    if (req.user.role === "resident") filter.resident = req.user.id;

    const payments = await PaymentDetail.find(filter)
      .populate("resident", "name email")
      .populate("specialPickupRequest", "wasteType estimatedWeight status");

    return res.json({ payments });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getByRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });
    const p = await PaymentDetail.findOne({ specialPickupRequest: id })
      .populate("resident", "name email")
      .populate("specialPickupRequest", "wasteType estimatedWeight status");
    if (!p) return res.status(404).json({ message: "Not found" });
    if (req.user.role === "resident" && p.resident?._id?.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    return res.json({ payment: p });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
