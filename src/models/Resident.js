import mongoose from "mongoose";
import userBaseSchema from "./UserBase.js";

const residentSchema = new mongoose.Schema({
  streetAddress: { type: String, required: true },
  residentType: { type: String, enum: ["household", "business"], required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  bankAccountNumber: { type: String, required: true },
  numberOfBins: { type: String, required: true },
});

residentSchema.add(userBaseSchema);
export default mongoose.model("Resident", residentSchema);