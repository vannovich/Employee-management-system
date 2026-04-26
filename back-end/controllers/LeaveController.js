import { inngest } from "../inngest/index.js";
import Employee from "../modals/Employee.js";
import LeaveApplication from "../modals/LeaveApplication.js";

/**
 * CREATE LEAVE
 * POST /api/leaves
 */
export const createLeave = async (req, res) => {
  try {
    const { userId } = req.user;

    const employee = await Employee.findOne({ UserId: userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (employee.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. You cannot apply for leave",
      });
    }

    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    const leave = await LeaveApplication.create({
      employeeId: employee._id,
      type,
      startDate: start,
      endDate: end,
      reason,
      status: "PENDING",
    });

    // SAFE INNGEST CALL
    try {
      await inngest.send({
        name: "leave/pending",
        data: { leaveApplicationId: leave._id.toString() },
      });
    } catch (eventError) {
      console.error("Inngest Error:", eventError);
      // do NOT crash API for event failure
    }

    return res.status(201).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error("Create Leave Error FULL:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Operation failed",
    });
  }
};

/**
 * GET LEAVES
 * GET /api/leaves
 */
export const getLeaves = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const isAdmin = role === "ADMIN";

    // ================= ADMIN =================
    if (isAdmin) {
      const status = req.query.status;
      const where = status ? { status } : {};

      const leaves = await LeaveApplication.find(where)
        .populate("employeeId")
        .sort({ createdAt: -1 });

      const data = leaves.map((l) => {
        const obj = l.toObject();

        return {
          ...obj,
          id: obj._id.toString(),
          employee: obj.employeeId,
          employeeId: obj.employeeId?._id?.toString(),
        };
      });

      return res.json({
        success: true,
        data,
      });
    }

    // ================= EMPLOYEE =================
    const employee = await Employee.findOne({ UserId: userId }); // FIXED

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const leaves = await LeaveApplication.find({
      employeeId: employee._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    console.error("Get Leaves Error:", error);

    return res.status(500).json({
      success: false,
      message: "Operation failed",
    });
  }
};

/**
 * UPDATE LEAVE STATUS
 * PATCH /api/leaves/:id
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const leave = await LeaveApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate("employeeId");

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    return res.json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error("Update Leave Error:", error);

    return res.status(500).json({
      success: false,
      message: "Operation failed",
    });
  }
};
