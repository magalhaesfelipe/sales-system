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
      select: false,
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
    passwordChangedAt: Date,
  },
  { strict: "throw" }
);


// INSTANCE METHODS FOR AUTHENTICATION

// Pre-save middleware to hash the password and remove 'passwordConfirm'
userSchema.pre("save", async function (next) {
  // Only run if password field is modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 13
  this.password = await bcrypt.hash(this.password, 13);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp; // If jwt was issued before the password change(jwt< passchange) returns true
  }

  return false; // If jwt was issued after the password change(JWT > passchange) returns false
};

export default mongoose.model("User", userSchema);
