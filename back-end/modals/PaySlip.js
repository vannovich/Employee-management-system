import mongoose, { mongo } from "mongoose";

const paySlipSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
  },
  { timestamps: true },
);

const PaySlip =
  mongoose.models.PaySlip || mongoose.model("PaySlip", paySlipSchema);

export default PaySlip;
