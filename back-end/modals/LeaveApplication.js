import mongoose, { mongo } from "mongoose";

const leaveApplicationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      reqiured: true,
    },
    type: { type: String, enum: ["SICK", "CASUAL", "ANNUAL"], reqiured: true },
    startDate: { type: Date, reqiured: true },
    endDate: { type: Date, required: true },
    reason: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

const LeaveApplication =
  mongoose.models.LeaveApplication ||
  mongoose.model("LeaveApplication", leaveApplicationSchema);

export default LeaveApplication;
