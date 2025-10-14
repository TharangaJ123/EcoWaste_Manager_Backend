import RouteAssignment from "../models/RouteAssignment.js";
import Staff from "../models/Staff.js";
import Resident from "../models/Resident.js";

export const createAssignment = async (req, res) => {
  try {
    const { staffId, routeName, area, date, time, frequency } = req.body || {};
    if (!staffId || !routeName || !area || !date || !time || !frequency) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // Normalize area key for matching residents
    const areaKey = String(area).trim();

    // Try to find existing assignment for same staff+area+date
    let assignment = await RouteAssignment.findOne({ staff: staffId, area: areaKey, date });

    // Build pickup points from residents in the same area (match city to area)
    const residents = await Resident.find({ city: areaKey }).select("streetAddress city name");
    const newPoints = residents
      .filter(r => r.streetAddress || r.name)
      .map(r => ({ label: r.streetAddress || r.name, detail: r.name ? `Resident: ${r.name}` : undefined }));

    if (assignment) {
      // Merge pickup points by label to avoid duplicates
      const existingLabels = new Set((assignment.pickupPoints || []).map(p => p.label));
      for (const p of newPoints) {
        if (!existingLabels.has(p.label)) {
          assignment.pickupPoints.push(p);
        }
      }
      // Update routeName/time/frequency as provided
      assignment.routeName = routeName;
      assignment.time = time;
      assignment.frequency = frequency;
      await assignment.save();
    } else {
      assignment = await RouteAssignment.create({
        staff: staffId,
        routeName,
        area: areaKey,
        date,
        time,
        frequency,
        status: "Scheduled",
        pickupPoints: newPoints,
      });
    }

    const populated = await RouteAssignment.findById(assignment._id).populate("staff", "name email role");
    return res.status(201).json({ assignment: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const listAssignments = async (req, res) => {
  try {
    const { role, id } = req.user || {};
    const filter = role === 'staff' ? { staff: id } : {};
    const assignments = await RouteAssignment.find(filter).sort({ createdAt: -1 }).populate("staff", "name email role");
    return res.json({ assignments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ["Scheduled", "Completed", "Cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const a = await RouteAssignment.findById(id);
    if (!a) return res.status(404).json({ message: "Not found" });
    a.status = status;
    await a.save();
    const populated = await RouteAssignment.findById(id).populate("staff", "name email role");
    return res.json({ assignment: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const a = await RouteAssignment.findById(id);
    if (!a) return res.status(404).json({ message: "Not found" });
    await a.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Staff: start a route (own route only)
export const startRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;
    const a = await RouteAssignment.findById(id);
    if (!a) return res.status(404).json({ message: "Not found" });
    if (role === 'staff' && String(a.staff) !== String(userId)) return res.status(403).json({ message: 'Forbidden' });
    if (!a.startedAt) a.startedAt = new Date();
    await a.save();
    const populated = await RouteAssignment.findById(id).populate("staff", "name email role");
    return res.json({ assignment: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Staff: toggle pickup point completion by index (own route only)
export const togglePickupPoint = async (req, res) => {
  try {
    const { id, index } = req.params;
    const { completed } = req.body || {};
    const userId = req.user?.id;
    const role = req.user?.role;
    const a = await RouteAssignment.findById(id);
    if (!a) return res.status(404).json({ message: "Not found" });
    if (role === 'staff' && String(a.staff) !== String(userId)) return res.status(403).json({ message: 'Forbidden' });
    const idx = Number(index);
    if (!Array.isArray(a.pickupPoints) || idx < 0 || idx >= a.pickupPoints.length) {
      return res.status(400).json({ message: 'Invalid pickup point index' });
    }
    a.pickupPoints[idx].completed = Boolean(completed);
    await a.save();
    const populated = await RouteAssignment.findById(id).populate("staff", "name email role");
    return res.json({ assignment: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
