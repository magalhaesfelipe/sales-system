import mongoose from "mongoose";
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please enter your name"] },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: { type: String, required: [true, 'Please provide a password'], minLength: 8 },
  passwordConfirm: { type: String, required: [true, 'Please confirm your password'] },
});

export default mongoose.model("User", userSchema);
