import mongoose from "mongoose";
import userBaseSchema from "./UserBase.js";

const staffSchema = new mongoose.Schema({
  emergencyContact: { type: String, required: true },
  employeeId: { type: String, required: true },
  department: { type: String, required: true },
  workLocation: { type: String, required: true },
  prefferedShift: { type: String, required: true },
  drivingLicenseNumber: { type: String, required: true },
});

staffSchema.add(userBaseSchema);
export default mongoose.model("Staff", staffSchema);
