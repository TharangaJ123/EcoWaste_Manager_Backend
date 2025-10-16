import mongoose from "mongoose";

const specialPickupRequestSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
    wasteType: { type: String, enum: ["bulky", "hazardous", "ewaste"], required: true },
    estimatedWeight: { type: Number, min: 0, required: true },
    description: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    address: {
      streetAddress: { type: String },
      city: { type: String },
      postalCode: { type: String },
      formatted: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "assigned", "rejected", "completed"],
      default: "pending",
    },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    routeAssignment: { type: mongoose.Schema.Types.ObjectId, ref: "RouteAssignment", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("SpecialPickupRequest", specialPickupRequestSchema);
