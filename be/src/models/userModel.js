import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please enter your name"] },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: 8,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
  },
  { strict: "throw" }
);

// PRE-SAVE MIDDLEWARE ON THE DOCUMENT
userSchema.pre("save", async function (next) {
  // Only run if password field is modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 13
  this.password = await bcrypt.hash(this.password, 13);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

export default mongoose.model("User", userSchema);
