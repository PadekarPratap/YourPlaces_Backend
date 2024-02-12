import { validationResult } from "express-validator";
import HttpError from "../models/http-error.js";

let DUMMY_USERS = [
  {
    id: 1,
    name: "Parth",
    email: "Parth@gmail.com",
    password: "123456",
  },
];

export const getAllUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

export const createUser = (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(422).json({ Error: err.array() });

  const { username, email, password } = req.body;

  const userExist = DUMMY_USERS.find((user) => user.email === email);

  if (userExist)
    return next(new HttpError("User already exist. Try logging in", 401));

  const newUser = {
    name: username,
    email,
    password,
  };

  DUMMY_USERS.push(newUser);

  return res.status(201).json({ user: newUser });
};

export const loginUser = (req, res, next) => {
  const { email, password } = req.body;

  const userExist = DUMMY_USERS.find((user) => user.email === email);

  if (!userExist || userExist.password !== password)
    return next(new HttpError("Invalid Creds", 422));

  return res.json({ message: "logged in" });
};
