import { DEPARTMENTS } from "../constants/departments.js";
import Attendance from "../modals/Attendance.js";
import Employee from "../modals/Employee.js";
import LeaveApplication from "../modals/LeaveApplication.js";
import PaySlip from "../modals/PaySlip.js";

/**
 * GET DASHBOARD
 * GET /api/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    const { userId, role } = req.user;

    // =====================
    // ADMIN DASHBOARD
    // =====================
    if (role === "ADMIN") {
      const [totalEmployees, todayAttendance, pendingLeaves] =
        await Promise.all([
          Employee.countDocuments({ isDeleted: { $ne: true } }),

          Attendance.countDocuments({
            date: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(24, 0, 0, 0)),
            },
          }),

          LeaveApplication.countDocuments({ status: "PENDING" }),
        ]);

      return res.json({
        success: true,
        data: {
          role: "ADMIN",
          totalEmployees,
          totalDepartments: DEPARTMENTS.length,
          todayAttendance,
          pendingLeaves,
        },
      });
    }

    // =====================
    // EMPLOYEE DASHBOARD
    // =====================

    // FIXED: use UserId (matches your schema)
    const employee = await Employee.findOne({ UserId: userId }).lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const today = new Date();

    const [currentMonthAttendance, pendingLeaves, latestPaySlip] =
      await Promise.all([
        Attendance.countDocuments({
          employeeId: employee._id,
          date: {
            $gte: new Date(today.getFullYear(), today.getMonth(), 1),
            $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
          },
        }),

        LeaveApplication.countDocuments({
          employeeId: employee._id,
          status: "PENDING",
        }),

        PaySlip.findOne({ employeeId: employee._id })
          .sort({ createdAt: -1 })
          .lean(),
      ]);

    return res.json({
      success: true,
      data: {
        role: "EMPLOYEE",
        employee: {
          ...employee,
          id: employee._id.toString(),
        },
        currentMonthAttendance,
        pendingLeaves,
        latestPaySlip: latestPaySlip
          ? {
              ...latestPaySlip,
              id: latestPaySlip._id.toString(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Operation failed",
    });
  }
};
