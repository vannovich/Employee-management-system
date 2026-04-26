import Employee from "../modals/Employee.js";
import bcrypt from "bcrypt";
import User from "../modals/User.js";

/**
 * GET EMPLOYEES
 * GET /api/employees
 */
export const getEmployees = async (req, res) => {
  try {
    const { department } = req.query;

    const where = {};
    if (department) where.department = department;

    const employees = await Employee.find(where)
      .sort({ createdAt: -1 })
      .populate("UserId", "email role")

      .lean();

    const result = employees.map((emp) => ({
      ...emp,
      id: emp._id.toString(),
      user: emp.UserId
        ? {
            email: emp.UserId.email,
            role: emp.UserId.role,
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch employees",
    });
  }
};

/**
 * CREATE EMPLOYEE
 * POST /api/employees
 */
export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      basicSalary,
      allowances,
      deductions,
      joinDate,
      password,
      role,
      bio,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
      role: role || "EMPLOYEE",
    });

    const employee = await Employee.create({
      UserId: user._id,
      firstName,
      lastName,
      email,
      phone,
      position,
      department: department || "Engineering",
      basicSalary: Number(basicSalary) || 0,
      allowances: Number(allowances) || 0,
      deductions: Number(deductions) || 0,
      joinDate: joinDate ? new Date(joinDate) : new Date(),
      bio: bio || "",
    });

    return res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create employee",
    });
  }
};

/**
 * UPDATE EMPLOYEE
 * PUT /api/employees/:id
 */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      basicSalary,
      allowances,
      deductions,
      password,
      role,
      bio,
      employeeStatus,
    } = req.body;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    await Employee.findByIdAndUpdate(id, {
      firstName,
      lastName,
      email,
      phone,
      position,
      department: department || "Engineering",
      basicSalary: Number(basicSalary) || 0,
      allowances: Number(allowances) || 0,
      deductions: Number(deductions) || 0,
      employeeStatus: employeeStatus || "ACTIVE",
      bio: bio || "",
    });

    // Update user safely
    const userUpdate = {};

    if (email) userUpdate.email = email;
    if (role) userUpdate.role = role;
    if (password) {
      userUpdate.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(employee.UserId, userUpdate);
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update employee",
    });
  }
};

/**
 * DELETE EMPLOYEE (soft delete)
 * DELETE /api/employees/:id
 */
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    employee.isDeleted = true;
    employee.employeeStatus = "INACTIVE";

    await employee.save();

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete employee",
    });
  }
};
