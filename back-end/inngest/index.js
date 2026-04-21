import { Inngest } from "inngest";
import Attendance from "../modals/Attendance.js";
import Employee from "../modals/Employee.js";
import LeaveApplication from "../modals/LeaveApplication.js";

// Create a client
export const inngest = new Inngest({ id: "ems-system" });

/**
 * ✅ AUTO CHECK-OUT FUNCTION
 */
const autoCheckOut = inngest.createFunction(
  {
    id: "auto-check-out",
    triggers: [{ event: "employee/check-in" }], // ✅ FIXED
  },
  async ({ event, step }) => {
    const { employeeId, attendanceId, checkInTime } = event.data;

    const checkInDate = new Date(checkInTime);

    // ⏳ Wait 9 hours
    await step.sleep("wait-9-hours", "9h");

    let attendance = await Attendance.findById(attendanceId);

    if (!attendance?.checkOut) {
      // ⏳ Wait 1 more hour
      await step.sleep("wait-10-hours", "1h");

      attendance = await Attendance.findById(attendanceId);

      if (!attendance?.checkOut) {
        attendance.checkOut = new Date(
          checkInDate.getTime() + 10 * 60 * 60 * 1000,
        );

        attendance.workingHours = 4;
        attendance.dayType = "Half Day";
        attendance.status = "LATE";

        await attendance.save();
      }
    }
  },
);

/**
 * ✅ LEAVE REMINDER FUNCTION
 */
const leaveApplicationReminder = inngest.createFunction(
  {
    id: "leave-application-reminder",
    triggers: [{ event: "leave/pending" }], // ✅ FIXED
  },
  async ({ event, step }) => {
    const { leaveApplicationId } = event.data;

    // ⏳ wait 24 hours
    await step.sleep("wait-24-hours", "24h");

    const leaveApplication =
      await LeaveApplication.findById(leaveApplicationId);

    if (leaveApplication?.status === "PENDING") {
      const employee = await Employee.findById(leaveApplication.employeeId);

      // 📧 send email here
    }
  },
);

/**
 * ✅ DAILY ATTENDANCE CRON
 */
const attendanceReminderCron = inngest.createFunction(
  {
    id: "attendance-reminder-cron",
    triggers: [{ cron: "0 0 6 * * *" }], // ✅ FIXED
  },
  async ({ step }) => {
    const today = await step.run("get-today-date", () => {
      const now = new Date();
      const start = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      return { start, end };
    });

    const activeEmployees = await step.run("get-active-employees", async () => {
      const employees = await Employee.find({
        isDeleted: false,
        employmentStatus: "ACTIVE",
      }).lean();

      return employees.map((e) => ({
        _id: e._id.toString(),
        name: `${e.firstName} ${e.lastName}`,
        email: e.email,
        department: e.department,
      }));
    });

    const onLeaveIds = await step.run("get-on-leave-ids", async () => {
      const leaves = await LeaveApplication.find({
        status: "APPROVED",
        startDate: { $lte: today.end },
        endDate: { $gte: today.start },
      }).lean();

      return leaves.map((l) => l.employeeId.toString());
    });

    const checkedInIds = await step.run("get-checked-in-ids", async () => {
      const attendances = await Attendance.find({
        date: { $gte: today.start, $lt: today.end },
      }).lean();

      return attendances.map((a) => a.employeeId.toString());
    });

    const absentEmployees = activeEmployees.filter(
      (emp) => !onLeaveIds.includes(emp._id) && !checkedInIds.includes(emp._id),
    );

    if (absentEmployees.length > 0) {
      await step.run("send-reminder-emails", async () => {
        await Promise.all(
          absentEmployees.map(async (emp) => {
            // 📧 send email here
          }),
        );
      });
    }

    return {
      totalActive: activeEmployees.length,
      onLeave: onLeaveIds.length,
      checkedIn: checkedInIds.length,
      absent: absentEmployees.length,
    };
  },
);

// ✅ Export functions
export const functions = [
  autoCheckOut,
  leaveApplicationReminder,
  attendanceReminderCron,
];
