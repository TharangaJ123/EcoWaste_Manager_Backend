import Bin from "../models/Bin.js";
import Resident from "../models/Resident.js";
import Staff from "../models/Staff.js";
import CollectionRecord from "../models/CollectionRecord.js";
import { sendEmail } from "../utils/sendEmail.js";

export const recordCollection = async (req, res) => {
  try {
    const { binId, weightKg, notes } = req.body;
    if (!binId) return res.status(400).json({ message: "binId is required" });
    const weight = Number(weightKg);
    if (!(weight > 0)) return res.status(400).json({ message: "weightKg must be > 0" });

    if (req.user?.role !== "staff") return res.status(403).json({ message: "Forbidden" });

    const bin = await Bin.findOne({ binId }).populate("resident", "email name");
    if (!bin) return res.status(404).json({ message: "Bin not found" });
    if (!bin.resident) return res.status(400).json({ message: "Bin is not linked to a resident" });

    const staff = await Staff.findById(req.user.id);
    if (!staff) return res.status(403).json({ message: "Forbidden" });

    const record = await CollectionRecord.create({
      bin: bin._id,
      resident: bin.resident._id || bin.resident,
      staff: staff._id,
      weightKg: weight,
      notes: notes || undefined,
    });

    bin.lastCollectedAt = new Date();
    bin.lastCollectedWeightKg = weight;
    bin.currentWeightKg = 0;
    await bin.save();

    try {
      if (bin.resident?.email) {
        await sendEmail(
          bin.resident.email,
          "Your bin has been collected",
          `Hello${bin.resident?.name ? " " + bin.resident.name : ""}, your bin ${binId} was collected. Recorded weight: ${weight} kg.`
        );
      }
    } catch (_) {}

    const populated = await CollectionRecord.findById(record._id)
      .populate("bin", "binId")
      .populate("resident", "name email")
      .populate("staff", "name email");

    return res.status(201).json({ record: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const listCollections = async (req, res) => {
  try {
    const { role, id } = req.user || {};
    const filter = {};
    if (role === "staff") filter.staff = id;
    else if (role === "resident") filter.resident = id;

    const records = await CollectionRecord.find(filter)
      .sort({ createdAt: -1 })
      .populate("bin", "binId")
      .populate("resident", "name email")
      .populate("staff", "name email");

    return res.json({ records });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
