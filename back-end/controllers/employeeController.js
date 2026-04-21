import Employee from "../modals/Employee.js";
import bcrypt from "bcrypt";
import User from "../modals/User.js";
// Get employee
// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    const { department } = req.query;
    const where = {};
    if (department) where.department = department;
    const employees = (await Employee.find(where))
      .toSorted((a, b) => b.createdAt - a.createdAt)
      .populate("UserId", "email role")
      .lean();
    const result = employees.map((emp) => ({
      ...emp,
      id: emp._id.toString(),
      user: emp.UserId
        ? { email: emp.UserId.email, role: emp.UserId.role }
        : null,
    }));
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create employee
// POST /api/employees/
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
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashed = await bscryp.hash(password, 10);
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

    return res.status(201).json({ success: true, employee: employee });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.log("Create employee error:", error);
    return res.status(500).json({ error: "Failed to create employee" });
  }
};

// Update employee
// PUT /api/employees/:id
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
      return res.status(404).json({ message: "Employee not found" });
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

    // Update User record
    const userUpdate = { email };
    if (role) userUpdate.role = role;
    if (password) userUpdate.password = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(employee.UserId, userUpdate);

    return res.status(201).json({ success: true });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // console.log("Create employee error:", error);
    return res.status(500).json({ error: "Failed to update employee" });
  }
};

// Delete employee
// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    employee.isDeleted = true;
    employee.employeeStatus = "INACTIVE";
    await employee.save();

    return res.json({ success: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete employee" });
  }
};
