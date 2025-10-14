import mongoose from "mongoose";

const binSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, unique: true, index: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
    wasteType: { type: String, enum: ["general", "recyclable", "organic", "hazardous", "ewaste", "plastic", "glass"], default: "general" },
    lastCollectedAt: { type: Date },
    lastCollectedWeightKg: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Bin", binSchema);
