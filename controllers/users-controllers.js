import { validationResult } from "express-validator";
import HttpError from "../models/http-error.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Place from "../models/Place.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}, "-password");

  return res.json({ users });
});

export const createUser = asyncHandler(async (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(422).json({ Error: err.array() });

  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser)
    return next(new HttpError("User already exists. Try logging in", 422));

  const hashedPassword = await bcrypt.hash(password, 12);

  const createdUser = new User({
    name: username,
    email,
    password: hashedPassword,
    places: [],
    image: req.file.path,
  });

  const result = await createdUser.save();

  // create a jwt token
  let token = jwt.sign(
    { userId: result._id, email: result.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.status(201).json({
    message: "User sign up successfully",
    userId: result._id,
    email: result.email,
    token,
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser)
    return next(new HttpError("Invalid Creds! Check email or password", 422));

  const isValidPassword = await bcrypt.compare(password, existingUser.password);

  if (!isValidPassword) {
    return next(new HttpError("Invalid Creds! Check email or password", 422));
  }

  // create a jwt token
  let token = jwt.sign(
    { userId: existingUser._id, email: existingUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.json({
    message: "Login successfull",
    userId: existingUser._id,
    email: existingUser.email,
    token,
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const { uid } = req.params;

  const sess = await mongoose.startSession();
  sess.startTransaction();
  const user = await User.findByIdAndDelete(uid, { session: sess });
  if (!user) return next(new HttpError("User cannot be found", 404));
  await Place.deleteMany({ creator: uid }, { session: sess });
  sess.commitTransaction();

  return res.json({
    message: "User deleted successfully",
    user,
  });
});
