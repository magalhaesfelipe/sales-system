import User from "../models/userModel.js";

export const Signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;
    const userData = { name, email, password, passwordConfirm };

    const newUser = await User.create(userData);

    res.status(201).json({
      status: 'success',
      message: 'User created!',
      data: newUser
    })
  } catch (error) {
    next(error);
  }
};
