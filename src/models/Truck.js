import mongoose from "mongoose";

const truckSchema = new mongoose.Schema(
  {
    truckId: { type: String, required: true, unique: true, index: true },
    vehicleNo: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 0 },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
  },
  { timestamps: true }
);

truckSchema.pre("validate", function (next) {
  if (!this.truckId) {
    this.truckId = `TRK-${Date.now()}`;
  }
  next();
});

// Ensure a staff member is assigned to at most one truck
truckSchema.index({ assignedStaff: 1 }, { unique: true, sparse: true });

export default mongoose.model("Truck", truckSchema);
