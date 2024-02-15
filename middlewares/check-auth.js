import jwt from "jsonwebtoken";
import HttpError from "../models/http-error.js";
import asyncHandler from "express-async-handler";

export const checkAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // { authorization: "Bearer token" }
    if (!token) return next(new HttpError("Authorization failed!", 401));

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decodedToken);

    req.user = { userId: decodedToken.userId };

    next();
  } catch (error) {
    return next(new HttpError("Authorization failed!", 401));
  }
};

// we use try catch block becasue .split method can crash if no authorization is passed
