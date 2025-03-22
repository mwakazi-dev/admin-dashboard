import mongoose from "mongoose";

// create user schema with username, email and password
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter your username"],
      unique: true,
      trim: true,
      minLength: [3, "Username must be at least 4 characters long"],
      validate: {
        validator: function (value: string) {
          const regex = /^[a-zA-Z0-9]+$/;
          return regex.test(value);
        },
        message: "Username can only contain alphanumeric characters",
      },
    },
    email: {
      type: String,
      required: [true, "Please enter your email address"],
      unique: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return regex.test(value);
        },
        message: "Invalid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
