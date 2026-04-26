import { inngest } from "../inngest/index.js";
import Attendance from "../modals/Attendance.js";
import Employee from "../modals/Employee.js";

/**
 * CLOCK IN / CLOCK OUT
 * POST /api/attendance
 */
export const clockInOut = async (req, res) => {
  try {
    const { userId } = req.user;

    // FIXED: schema consistency
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
        message: "Your account is deactivated. You cannot clock in/out",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();

    const existing = await Attendance.findOne({
      employeeId: employee._id,
      date: today,
    });

    // =====================
    // CLOCK IN
    // =====================
    if (!existing) {
      const isLate =
        now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);

      const attendance = await Attendance.create({
        employeeId: employee._id,
        date: today,
        checkIn: now,
        status: isLate ? "LATE" : "PRESENT",
      });

      try {
        await inngest.send({
          name: "employee/check-in",
          data: {
            employeeId: employee._id,
            attendanceId: attendance._id,
          },
        });
      } catch (error) {
        console.log("Error in the employee-check-in");
      }

      return res.json({
        success: true,
        type: "CHECK_IN",
        data: attendance,
      });
    }

    // =====================
    // CLOCK OUT
    // =====================
    if (!existing.checkOut) {
      const checkInTime = new Date(existing.checkIn).getTime();
      const diffMs = now.getTime() - checkInTime;
      const diffHours = diffMs / (1000 * 60 * 60);

      existing.checkOut = now;

      const workingHours = Number(diffHours.toFixed(2));

      let dayType = "Short Day";
      if (workingHours >= 8) dayType = "Full Day";
      else if (workingHours >= 6) dayType = "Three Quarter Day";
      else if (workingHours >= 4) dayType = "Half Day";

      existing.workingHours = workingHours;
      existing.dayType = dayType;

      await existing.save();

      return res.json({
        success: true,
        type: "CHECK_OUT",
        data: existing,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Already checked in and out for today",
    });
  } catch (error) {
    console.error("Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Operation failed",
    });
  }
};

/**
 * GET ATTENDANCE HISTORY
 * GET /api/attendance
 */
export const getAttendance = async (req, res) => {
  try {
    const { userId } = req.user;

    // ✅ ALWAYS match schema field exactly
    const employee = await Employee.findOne({ UserId: userId }).lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (employee.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const limit = parseInt(req.query.limit, 10) || 30;

    const history = await Attendance.find({
      employeeId: employee._id,
    })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    // ✅ Normalize response
    const data = history.map((item) => ({
      ...item,
      id: item._id.toString(),
    }));

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
