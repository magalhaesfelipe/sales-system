import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import AppError from "./../utils/appError.js";
import { promisify } from "util";

// Function to Sign function
export const signToken = (id) => {
  // jwt.sign({payload data}, secret-string, {options})
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = async (req, res, next) => {
  try {
    // Avoiding mass-assigment
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      message: "User created!",
      data: newUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }
    // 2 ) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401)); // 401 is unauthorized
    }

    // 3) If everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const protect = async (req, res, next) => {
  try {
    // 1) Checking if there is token and getting it
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("No token found! Please log in again.", 401));
    }

    // 2) Verification if token payload(user id) was modified or if token if expired
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (error) {
      return next(new AppError("Invalid token! Please log in again.", 401));
    }

    // 3) Check if user still exists with the decoded id
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists ", 401)
      );
    }

    // 4) Check if user changed password after the token was issued
    // iat === 'issued at'
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password. Please log in again.",
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser; // Passing the user to the request, making available to other middleware
    next();
  } catch (error) {
    next(error);
  }
};
