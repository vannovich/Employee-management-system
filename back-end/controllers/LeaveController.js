import { inngest } from "../inngest/index.js";
import Employee from "../modals/Employee.js";
import LeaveApplication from "../modals/LeaveApplication.js";
// Create leave
// POST /api/leaves

export const createLeave = async (req, res) => {
  try {
    const session = req.session;
    const employee = await Employee.findOne({ userId: session.userId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (employee.isDeleted) {
      return res.return(403).json({
        error: "Your account is deactivated. You cannot apply for leave",
      });
    }

    const { type, startDate, endDate, reason } = req.body;
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: "Missing fields are required" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(startDate) < new Date(endDate)) {
      return res
        .status(400)
        .json({ error: "Start date must be before end date" });
    }
    const leave = await LeaveApplication.create({
      employeeId: employee._id,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "PENDING",
    });

    // event
    await inngest.send({
      name: "leave/pending",
      data: { leaveApplicationId: leave._id },
    });
    return res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ error: "Operation failed" });
  }
};

// Create leave
// POST /api/leaves
export const getLeaves = async (req, res) => {
  try {
    const session = req.session;
    const isAdmin = session.role === "ADMIN";
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
      return res.json({ success: true, data });
    } else {
      const employee = await Employee.findOne({ userId: session.userId });
      if (!employee)
        return res.status(404).json({ error: "Employee not found" }).lean();
      const leaves = await LeaveApplication.find({
        employeeId: employee._id,
      }).sort({ createdAt: -1 });
      return res.json({
        ...employee,
        id: employee._id.toString(),
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Operation failed" });
  }
};

// Update leave status
// PATCH /api/leaves/:id

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const leave = await LeaveApplication.findOneAndUpdate(
      res.params.id,
      { status },
      { returnDocument: "after" },
    );
    return res.json({ success: true, data: leave });
  } catch (error) {
    return res.status(500).json({ error: "Operation failed" });
  }
};
