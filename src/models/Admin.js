import mongoose from "mongoose";
import userBaseSchema from "./UserBase.js";

const adminSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  department: { type: String, required: true },
  accessLevel: { type: String, required: true },
  assignedRegion: { type: String, required: true },
  authorizationCode: { type: String, required: true },
  systemPermissions: {
    userManagement: { type: Boolean, default: false },
    financialReports: { type: Boolean, default: false },
    policyManagement: { type: Boolean, default: false },
    systemConfiguration: { type: Boolean, default: false },
    dataAnalytics: { type: Boolean, default: false },
    emergencyOverride: { type: Boolean, default: false },
  }
});

adminSchema.add(userBaseSchema);
export default mongoose.model("Admin", adminSchema);