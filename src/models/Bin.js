import mongoose from "mongoose";

const binSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, unique: true, index: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
    wasteType: { type: String, enum: ["hazardous", "ewaste", "plastic", "glass"], default: "general" },
    currentWeightKg: { type: Number, default: 0 },
    capacityKg: { type: Number, default: 50 },
    lastCollectedAt: { type: Date },
    lastCollectedWeightKg: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Bin", binSchema);
