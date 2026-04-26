import Employee from "../modals/Employee.js";

/**
 * GET PROFILE
 * GET /api/profile
 */
export const getProfile = async (req, res) => {
  try {
    const { userId, email, role } = req.user;

    // FIXED: use correct schema field
    const employee = await Employee.findOne({ UserId: userId }).lean();

    if (!employee) {
      return res.json({
        firstName: "Admin",
        lastName: "",
        email,
        role,
      });
    }

    return res.json({
      ...employee,
      id: employee._id.toString(),
      email,
      role,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

/**
 * UPDATE PROFILE
 * PUT /api/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    // FIXED lookup
    const employee = await Employee.findOne({ UserId: userId });

    if (!employee) {
      return res.status(404).json({
        message: "Employee Not Found",
      });
    }

    if (employee.isDeleted) {
      return res.status(403).json({
        message: "Your account is deactivated. You cannot update your profile",
      });
    }

    await Employee.findByIdAndUpdate(employee._id, {
      bio: req.body.bio,
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};
