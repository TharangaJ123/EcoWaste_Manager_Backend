import Joi from "joi";
import Truck from "../models/Truck.js";
import Staff from "../models/Staff.js";
import CollectionRecord from "../models/CollectionRecord.js";

const schema = Joi.object({
  vehicleNo: Joi.string().trim().min(1).required(),
  capacity: Joi.number().min(0).required(),
});

export const createTruck = async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { vehicleNo, capacity } = value;

    const existing = await Truck.findOne({ vehicleNo });
    if (existing) return res.status(409).json({ message: "Vehicle number already exists" });

    const truck = await Truck.create({ vehicleNo, capacity });
    return res.status(201).json({ truck });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "Duplicate key" });
    return res.status(500).json({ message: "Server error" });
  }
};

export const todaySummary = async (_req, res) => {
  try {
    const agg = await CollectionRecord.aggregate([
      { $group: { _id: "$staff", totalWeightKg: { $sum: "$weightKg" } } }
    ]);

    const staffIds = agg.map(a => a._id).filter(Boolean);
    const staffs = await Staff.find({ _id: { $in: staffIds } }).select("name email").lean();
    const staffMap = new Map(staffs.map(s => [String(s._id), s]));

    const trucks = await Truck.find({ assignedStaff: { $in: staffIds } }).select("assignedStaff truckId vehicleNo capacity").lean();
    const truckByStaff = new Map(trucks.map(t => [String(t.assignedStaff), t]));

    const perStaff = agg.map(a => {
      const sid = String(a._id);
      const s = staffMap.get(sid) || {};
      const tr = truckByStaff.get(sid) || null;
      return {
        staffId: a._id,
        staffName: s.name || s.email || "Staff",
        truck: tr ? { truckId: tr.truckId, vehicleNo: tr.vehicleNo, capacity: tr.capacity } : null,
        totalWeightKg: a.totalWeightKg || 0,
      };
    });

    const totalWeightKgToday = perStaff.reduce((sum, r) => sum + (r.totalWeightKg || 0), 0);
    return res.json({ totalWeightKgToday, perStaff });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const listTrucks = async (_req, res) => {
  try {
    const trucks = await Truck.find().populate("assignedStaff", "name email");
    return res.json({ trucks });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const listAvailableStaff = async (req, res) => {
  try {
    // Optionally include currently assigned staff for a given truck so dropdown shows current selection too
    const { truckId } = req.query;
    const assigned = await Truck.find({ assignedStaff: { $ne: null } }, { assignedStaff: 1 }).lean();
    const assignedIds = new Set(assigned.map(t => String(t.assignedStaff)));

    let includeId = null;
    if (truckId) {
      const t = await Truck.findById(truckId).lean();
      if (t?.assignedStaff) includeId = String(t.assignedStaff);
    }

    const filter = includeId ? { $or: [ { _id: { $nin: Array.from(assignedIds) } }, { _id: includeId } ] } : { _id: { $nin: Array.from(assignedIds) } };
    const staff = await Staff.find(filter).select("name email").lean();
    return res.json({ staff });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const assignStaff = async (req, res) => {
  try {
    const { id } = req.params; // truck id
    const { staffId } = req.body; // can be null to unassign

    // If assigning, ensure that staff isn't already assigned elsewhere
    if (staffId) {
      const exists = await Staff.findById(staffId).lean();
      if (!exists) return res.status(400).json({ message: "Invalid staffId" });
      const other = await Truck.findOne({ assignedStaff: staffId, _id: { $ne: id } }).lean();
      if (other) return res.status(409).json({ message: "Staff already assigned to another truck" });
    }

    const updated = await Truck.findByIdAndUpdate(
      id,
      { $set: { assignedStaff: staffId || null } },
      { new: true }
    ).populate("assignedStaff", "name email");
    if (!updated) return res.status(404).json({ message: "Truck not found" });
    return res.json({ truck: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
