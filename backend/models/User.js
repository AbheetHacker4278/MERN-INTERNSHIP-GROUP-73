import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    minLength: [3, "Name must be at least 3 characters long"],
    maxLength: [30, "Name cannot exceed 30 characters"]
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email address"]
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "Password must be at least 8 characters long"],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"]
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

export const User = mongoose.model("User", userSchema);