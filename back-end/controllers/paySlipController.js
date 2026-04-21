import PaySlip from "../modals/PaySlip.js";

// create payslip
// POST /api/payslips
export const createPaySlip = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions } =
      req.body;
    if (!employeeId || !month || !year || !basicSalary) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const netSalary = basic + Number(allowances || 0) - Number(deductions || 0);
    const paySlip = await PaySlip.create({
      employeeId,
      month: Number(month),
      year: Number(year),
      basicSalary: Number(basicSalary),
      allowances: Number(allowances || 0),
      deductions: Number(deductions || 0),
      netSalary,
    });
    res.status(201).json({ success: true, data: paySlip });
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
};

// Get payslips
// GET /api/payslips
export const getPaySlips = async (req, res) => {
  try {
    const session = req.session;
    const isAdmin = session.role === "ADMIN";
    if (isAdmin) {
      const payslips = await PaySlip.find()
        .populate("employeeId")
        .sort({ createdAt: -1 });

      const data = payslips.map((p) => {
        const obj = p.toObject();
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
        return res.status(404).json({ error: "Employee not found" });
      const payslips = await PaySlip.find({ employeeId: employee._id }).sort({
        createdAt: -1,
      });
      return res.json({ data: payslips });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed" });
  }
};

// Get payslip by ID
// GET /api/payslips/:id
export const getPaySlipById = async (req, res) => {
  try {
    const payslip = await PaySlip.findById(req.params.id)
      .populate("employeeId")
      .lean();

    if (!payslip) return res.status(404).json({ error: "Payslip not found" });

    const result = {
      ...payslip,
      id: payslips._id.toString(),
      employee: payslip.employeeId,
    };
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ error: "Failed" });
  }
};
