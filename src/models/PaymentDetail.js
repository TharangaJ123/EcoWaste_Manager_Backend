import mongoose from "mongoose";

const paymentDetailSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
    specialPickupRequest: { type: mongoose.Schema.Types.ObjectId, ref: "SpecialPickupRequest", required: true, index: true },
    generalCharge: { type: Number, required: true, default: 0 },
    specialCharge: { type: Number, required: true, default: 0 },
    recycleCredit: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["Pending", "Paid", "Overdue"], default: "Pending" },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentDetail", paymentDetailSchema);
