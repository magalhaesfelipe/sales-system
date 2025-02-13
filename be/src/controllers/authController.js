import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const Signup = async (req, res, next) => {
  try {
    // Avoiding mass-assigment
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    // jwt.sign({payload data}, secret-string, {options})
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      status: "success",
      message: "User created!",
      token,
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};
