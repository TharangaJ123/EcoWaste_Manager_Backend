import mongoose from "mongoose";

const userBaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  contactNumber: { type: String },
  role: { type: String, enum: ["admin", "staff", "resident"], required: true },
}, { timestamps: true });

export default userBaseSchema;
