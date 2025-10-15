import Bin from "../models/Bin.js";

export const listBins = async (req, res) => {
  try {
    const { role, id } = req.user || {};
    const { residentId } = req.query || {};

    let filter = {};
    if (role === "resident") {
      filter.resident = id;
    } else if (role === "admin" || role === "staff") {
      if (!residentId) return res.status(400).json({ message: "residentId is required" });
      filter.resident = residentId;
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    const bins = await Bin.find(filter).select("binId wasteType resident currentWeightKg capacityKg lastCollectedAt lastCollectedWeightKg");
    res.json({ bins });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

export const lookupByBinId = async (req, res) => {
  try {
    const { binId } = req.query || {};
    if (!binId) return res.status(400).json({ message: 'binId is required' });
    const bin = await Bin.findOne({ binId }).populate('resident', 'name email streetAddress city postalCode');
    if (!bin) return res.status(404).json({ message: 'Bin not found' });
    res.json({ bin });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addWeight = async (req, res) => {
  try {
    const { id: userId, role } = req.user || {};
    const { id } = req.params;
    const { amountKg } = req.body || {};
    const amount = Number(amountKg);
    if (!(amount > 0)) return res.status(400).json({ message: "amountKg must be > 0" });

    const bin = await Bin.findById(id);
    if (!bin) return res.status(404).json({ message: "Bin not found" });

    if (role === 'resident' && String(bin.resident) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const newWeight = (bin.currentWeightKg || 0) + amount;
    bin.currentWeightKg = newWeight;
    await bin.save();
    res.json({ bin });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};
