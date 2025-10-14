import mongoose from "mongoose";

const collectionRecordSchema = new mongoose.Schema(
  {
    bin: { type: mongoose.Schema.Types.ObjectId, ref: "Bin", required: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    weightKg: { type: Number, required: true, min: 0 },
    collectedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("CollectionRecord", collectionRecordSchema);
