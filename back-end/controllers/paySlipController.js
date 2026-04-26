import PaySlip from "../modals/PaySlip.js";
import Employee from "../modals/Employee.js";

/**
 * CREATE PAYSLIP
 * POST /api/payslips
 */
export const createPaySlip = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions } =
      req.body;

    if (!employeeId || !month || !year || !basicSalary) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const netSalary =
      Number(basicSalary) + Number(allowances || 0) - Number(deductions || 0);

    const paySlip = await PaySlip.create({
      employeeId,
      month: Number(month),
      year: Number(year),
      basicSalary: Number(basicSalary),
      allowances: Number(allowances || 0),
      deductions: Number(deductions || 0),
      netSalary,
    });

    return res.status(201).json({
      success: true,
      data: paySlip,
    });
  } catch (error) {
    console.error("Create PaySlip Error:", error);
    return res.status(500).json({
      message: "Failed to create payslip",
    });
  }
};

/**
 * GET ALL PAYSLIPS
 * GET /api/payslips
 */
export const getPaySlips = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const isAdmin = role === "ADMIN";

    // =====================
    // ADMIN
    // =====================
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

      return res.json({
        success: true,
        data,
      });
    }

    // =====================
    // EMPLOYEE (FIXED HERE)
    // =====================
    const employee = await Employee.findOne({ UserId: userId });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const payslips = await PaySlip.find({
      employeeId: employee._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: payslips,
    });
  } catch (error) {
    console.error("Get PaySlips Error:", error);
    return res.status(500).json({
      message: "Failed to fetch payslips",
    });
  }
};

/**
 * GET PAYSLIP BY ID
 * GET /api/payslips/:id
 */
export const getPaySlipById = async (req, res) => {
  try {
    const payslip = await PaySlip.findById(req.params.id)
      .populate("employeeId")
      .lean();

    if (!payslip) {
      return res.status(404).json({
        message: "Payslip not found",
      });
    }

    const result = {
      ...payslip,
      id: payslip._id.toString(),
      employee: payslip.employeeId,
    };

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get PaySlip By ID Error:", error);
    return res.status(500).json({
      message: "Failed to fetch payslip",
    });
  }
};
