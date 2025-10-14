import SpecialPickupRequest from "../models/SpecialPickupRequest.js";
import Resident from "../models/Resident.js";
import Staff from "../models/Staff.js";
import Admin from "../models/Admin.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createRequest = async (req, res) => {
  try {
    const { wasteType, estimatedWeight, description, preferredDate } = req.body;

    if (!wasteType || !["bulky", "hazardous", "ewaste"].includes(wasteType)) {
      return res.status(400).json({ message: "Invalid wasteType" });
    }
    if (estimatedWeight == null || Number(estimatedWeight) <= 0) {
      return res.status(400).json({ message: "Invalid estimatedWeight" });
    }
    if (!description || !preferredDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const residentId = req.user.id;
    const resident = await Resident.findById(residentId);
    if (!resident) return res.status(404).json({ message: "Resident not found" });

    const address = {
      streetAddress: resident.streetAddress,
      city: resident.city,
      postalCode: resident.postalCode,
      formatted: [resident.streetAddress, resident.city, resident.postalCode].filter(Boolean).join(', '),
    };

    const request = await SpecialPickupRequest.create({
      resident: residentId,
      wasteType,
      estimatedWeight,
      description,
      preferredDate: new Date(preferredDate),
      address,
    });

    try {
      if (resident.email) {
        await sendEmail(
          resident.email,
          "Special Pickup Request Submitted",
          `Your ${wasteType} pickup request has been submitted and is pending approval.`
        );
      }
    } catch (_) {}

    return res.status(201).json({ request });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const listRequests = async (req, res) => {
  try {
    const role = req.user.role;
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (role === "resident") {
      filter.resident = req.user.id;
    } else if (role === "staff") {
      filter.assignedStaff = req.user.id;
    }

    const requests = await SpecialPickupRequest.find(filter)
      .populate("resident", "name email")
      .populate("assignedStaff", "name email")
      .populate("approvedBy", "name email");

    return res.json({ requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await SpecialPickupRequest.findById(id)
      .populate("resident", "name email")
      .populate("assignedStaff", "name email")
      .populate("approvedBy", "name email");
    if (!r) return res.status(404).json({ message: "Not found" });
    const role = req.user.role;
    if (role === "resident" && r.resident?.id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (role === "staff" && r.assignedStaff?.id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.json({ request: r });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const adminId = req.user.id;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: "Forbidden" });

    const r = await SpecialPickupRequest.findById(id).populate("resident", "email");
    if (!r) return res.status(404).json({ message: "Not found" });

    if (action === "approve") {
      r.status = "approved";
      r.approvedBy = adminId;
    } else if (action === "reject") {
      r.status = "rejected";
      r.approvedBy = adminId;
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await r.save();

    try {
      if (r.resident?.email) {
        await sendEmail(
          r.resident.email,
          `Special Pickup ${r.status}`,
          `Your request has been ${r.status}.`
        );
      }
    } catch (_) {}

    return res.json({ request: r });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const assignStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;
    if (!staffId) return res.status(400).json({ message: "staffId is required" });
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const r = await SpecialPickupRequest.findById(id)
      .populate("resident", "email")
      .populate("assignedStaff", "email");
    if (!r) return res.status(404).json({ message: "Not found" });

    if (r.status !== "approved" && r.status !== "assigned") {
      return res.status(400).json({ message: "Request must be approved before assignment" });
    }

    r.assignedStaff = staffId;
    r.status = "assigned";

    await r.save();

    try {
      if (staff.email) {
        await sendEmail(
          staff.email,
          "New Special Pickup Assigned",
          `You have been assigned a ${r.wasteType} pickup request.`
        );
      }
      if (r.resident?.email) {
        await sendEmail(
          r.resident.email,
          "Pickup Request Assigned",
          `Your request has been assigned to a staff member.`
        );
      }
    } catch (_) {}

    return res.json({ request: r });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "approved", "assigned", "rejected", "completed"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const r = await SpecialPickupRequest.findById(id).populate("resident", "email");
    if (!r) return res.status(404).json({ message: "Not found" });

    if (req.user.role === "staff") {
      if (status !== "completed") return res.status(403).json({ message: "Forbidden" });
      if (r.assignedStaff?.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    r.status = status;
    await r.save();

    try {
      if (r.resident?.email) {
        await sendEmail(
          r.resident.email,
          `Pickup Request ${status}`,
          `Your special pickup status is now ${status}.`
        );
      }
    } catch (_) {}

    return res.json({ request: r });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
