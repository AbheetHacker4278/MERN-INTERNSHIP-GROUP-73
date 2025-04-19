import ErrorHandler from "../middlewares/error.js";
import { Reservation } from "../models/reservation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// Middleware to check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    
    if (!token) {
      return next(new ErrorHandler("Please login to access this resource", 401));
    }
    
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = await User.findById(decodedData.id);
    
    next();
  } catch (error) {
    return next(new ErrorHandler("Authentication failed", 401));
  }
};

const send_reservation = async (req, res, next) => {
  const { firstName, lastName, email, date, time, phone } = req.body;
  
  // Check if all required fields are provided
  if (!firstName || !lastName || !email || !date || !time || !phone) {
    return next(new ErrorHandler("Please Fill Full Reservation Form!", 400));
  }
  
  try {
    // Associate reservation with the logged-in user
    const reservation = await Reservation.create({
      firstName,
      lastName,
      email,
      date,
      time,
      phone,
      user: req.user._id // Associate reservation with user
    });
    
    res.status(201).json({
      success: true,
      message: "Reservation Sent Successfully!",
      reservation
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return next(new ErrorHandler(validationErrors.join(', '), 400));
    }
    
    // Handle other errors
    return next(error);
  }
};

// Cancel a reservation
export const cancelReservation = async (req, res, next) => {
  try {
    const { reservationId } = req.params;

    // Validate reservation ID
    if (!reservationId || !mongoose.Types.ObjectId.isValid(reservationId)) {
      return next(new ErrorHandler("Invalid reservation ID format", 400));
    }

    // Find and validate the reservation
    const reservation = await Reservation.findOneAndUpdate(
      {
        _id: reservationId,
        user: req.user._id,
        status: { $ne: 'canceled' } // Only find if not already canceled
      },
      { 
        $set: { 
          status: 'canceled',
          updatedAt: new Date() 
        } 
      },
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validators on update
      }
    ).populate('user', 'name email'); // Optional: populate user details

    if (!reservation) {
      return next(new ErrorHandler(
        "Reservation not found, already canceled, or you don't have permission", 
        404
      ));
    }

    // Optional: Send cancellation email notification
    try {
      await sendCancellationEmail({
        email: reservation.email,
        name: `${reservation.firstName} ${reservation.lastName}`,
        date: reservation.date,
        time: reservation.time
      });
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Reservation canceled successfully",
      data: {
        id: reservation._id,
        status: reservation.status,
        updatedAt: reservation.updatedAt,
        details: {
          name: `${reservation.firstName} ${reservation.lastName}`,
          date: reservation.date,
          time: reservation.time
        }
      }
    });

  } catch (error) {
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return next(new ErrorHandler("Invalid reservation ID format", 400));
    }
    if (error.name === 'ValidationError') {
      return next(new ErrorHandler(error.message, 400));
    }
    return next(error);
  }
};

export const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("User with this email already exists", 409));
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    // Set cookie options
    const options = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true
    };
    
    // Send response with token in cookie
    res.status(201)
      .cookie("token", token, options)
      .json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return next(new ErrorHandler(validationErrors.join(', '), 400));
    }
    
    return next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }
  
  try {
    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    
    // Check if user exists
    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    // Set cookie options
    const options = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true
    };
    
    // Send response with token in cookie
    res.status(200)
      .cookie("token", token, options)
      .json({
        success: true,
        message: "Logged in successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
  } catch (error) {
    return next(error);
  }
};

// Get logged in user details
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return next(error);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true
    });
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return next(error);
  }
};

// Get all reservations for the logged in user
export const getUserReservations = async (req, res, next) => {
  try {
    // Find all reservations where the user field matches the currently logged in user's ID
    const reservations = await Reservation.find({ user: req.user._id });
    
    // Check if any reservations were found
    if (reservations.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No reservations found for this user",
        reservations: []
      });
    }
    
    // Return the reservations
    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations
    });
  } catch (error) {
    return next(error);
  }
};

export default send_reservation;