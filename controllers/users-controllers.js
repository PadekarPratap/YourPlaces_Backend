import { validationResult } from "express-validator";
import HttpError from "../models/http-error.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Place from "../models/Place.js";
import mongoose from "mongoose";

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

  const createdUser = new User({
    name: username,
    email,
    password,
    places: [],
    // dummy
    image:
      "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fprofile-avatar&psig=AOvVaw3arn5F1YbMlEiOsqTBibUs&ust=1707918037434000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCOjgh9G4qIQDFQAAAAAdAAAAABAE",
  });

  const result = await createdUser.save();

  return res.status(201).json({
    message: "User sign up successfully",
    user: result,
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser || existingUser.password !== password)
    return next(
      new HttpError("Invalid Creds! Password or email is incorrect", 422)
    );

  return res.json({
    message: "Login successfull",
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
