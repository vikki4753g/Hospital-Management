import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    appointment_time,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
  } = req.body;

  // Check for missing fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !appointment_date ||
    !appointment_time ||
    !department ||
    !doctor_firstName ||
    !doctor_lastName ||
    !address
  ) {
    return next(new ErrorHandler("All fields are required!", 400));
  }

  // Find the doctor by name and department
  const doctor = await User.findOne({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });

  if (!doctor) {
    return next(
      new ErrorHandler("Doctor not found in the specified department!", 404)
    );
  }

  const patientId = req.user?._id; // Requires user authentication
  if (!patientId) {
    return next(new ErrorHandler("Authentication required!", 401));
  }
  const appointmentTotal = await Appointment.find({
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    appointment_date,
    appointment_time,
  });
  // console.log(appointmentTotal);

  if (appointmentTotal.length > 0) {
    return next(
      new ErrorHandler(
        "This slot of appointment already booked ,please selct another slot!",
        404
      )
    );
  }
  // Create the appointment
  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    appointment_time,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    hasVisited,
    address,
    doctorId: doctor._id,
    patientId,
  });

  res.status(201).json({
    success: true,
    appointment,
    message: "Appointment successfully created!",
  });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const user = req.user; // Requires user authentication
  if (user.role !== "Admin") {
    return next(
      new ErrorHandler(
        "Access denied! Only admins can view all appointments.",
        403
      )
    );
  }

  const appointments = await Appointment.find();
  res.status(200).json({
    success: true,
    appointments,
  });
});

export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const user = req.user; // Requires user authentication
    if (user.role !== "Admin") {
      return next(
        new ErrorHandler(
          "Access denied! Only admins can update appointment status.",
          403
        )
      );
    }

    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      updatedAppointment,
      message: "Appointment status updated successfully!",
    });
  }
);

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const user = req.user; // Requires user authentication
  if (user.role !== "Admin") {
    return next(
      new ErrorHandler(
        "Access denied! Only admins can delete appointments.",
        403
      )
    );
  }

  const { id } = req.params;
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }

  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    message: "Appointment deleted successfully!",
  });
});
