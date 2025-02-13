import User from "../models/userModel.js";

export const Signup = async (req, res, next) => {
  try {
    // Avoiding mass-assigment
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.email,
      passwordConfirm: req.body.passwordConfirm,
    });

    res.status(201).json({
      status: "success",
      message: "User created!",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};
