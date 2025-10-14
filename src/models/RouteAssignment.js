import mongoose from "mongoose";

const routeAssignmentSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    routeName: { type: String, required: true },
    area: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    frequency: { type: String, enum: ["Daily", "Weekly", "Monthly"], default: "Daily" },
    status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
    startedAt: { type: Date },
    pickupPoints: [
      {
        label: { type: String, required: true },
        detail: { type: String },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

// Prevent multiple routes for the same staff+area+date (one route per area per day)
routeAssignmentSchema.index({ staff: 1, area: 1, date: 1 }, { unique: true });

export default mongoose.model("RouteAssignment", routeAssignmentSchema);
