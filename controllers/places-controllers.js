import fs from "fs";
import { validationResult } from "express-validator";
import HttpError from "../models/http-error.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import { addressToCoordinates } from "../utils/location.js";
import Place from "../models/Place.js";
import User from "../models/User.js";

export const getPlaceById = asyncHandler(async (req, res, next) => {
  const { pid } = req.params;

  const place = await Place.findById(pid);

  if (!place) return next(new HttpError("Place could not be found", 404));

  return res.json({
    message: "Place found successfully",
    place: place.toObject({ getters: true }), // this gives a normal id along with _id (not important)
  });
});

export const getPlacesByUserId = asyncHandler(async (req, res, next) => {
  const { uid } = req.params;

  const places = await Place.find({ creator: uid });

  if (!places) return next(new HttpError("No places created by the user", 404));

  return res.json({
    message: "Places fetched successfully",
    places,
  });
});

export const createPlace = asyncHandler(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return res.status(422).json({ Error: error.array() });

  const { title, description, address } = req.body;

  // get the co-ordinates of the address
  let location;
  try {
    location = await addressToCoordinates(address);
  } catch (err) {
    return next(
      new HttpError("Invalid Address. No Co-ordinates could be found!", 404)
    );
  }

  // wether the user/creator exist or not
  const userExist = await User.findById(req.user.userId);
  if (!userExist) return next(new HttpError("Could not find the user.", 404));

  const createdPlace = new Place({
    title,
    description,
    address,
    creator: req.user.userId,
    location,
    image: req.file.path,
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  const result = await createdPlace.save({ session });
  await userExist.places.push(createdPlace); // not the array method but a mongoose methos which only pushes the _id of the place
  await userExist.save({ session });
  await session.commitTransaction();

  return res
    .status(201)
    .json({ message: "Place created successfully!", place: result });
});

export const updatePlace = asyncHandler(async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return res.status(422).json({ Error: error.array() });

  const { pid } = req.params;
  const { title, description } = req.body;

  // Adding authorization
  // make sure that user who created the place can only update the place
  let place = await Place.findById(pid);
  if (!place) return next(new HttpError("Place does not exist", 404));
  if (place.creator.toString() !== req.user.userId) {
    return next(
      new HttpError("You do not have the permission to update the place", 400)
    );
  }

  place = await Place.findByIdAndUpdate(
    pid,
    { title, description },
    { new: true }
  );

  if (!place)
    return next(
      new HttpError("Could not update the place. Please try again later", 400)
    );

  return res.json({ message: "Place updated successfully", place });
});

export const deletePlace = asyncHandler(async (req, res, next) => {
  const { pid } = req.params;

  /*
  const place = await Place.findByIdAndDelete(pid, { new: true });
  
  if (!place) return next(new HttpError("Place could not be deleted", 400));
  
  return res.json({
    message: "Place deleted successfully",
    place,
  });
  */

  // Adding authorization
  // make sure that user who created the place can only delete the place
  let place = await Place.findById(pid);
  if (!place) return next(new HttpError("Place does not exist", 404));
  if (place.creator.toString() !== req.user.userId) {
    return next(
      new HttpError("You do not have the permission to delete the place", 400)
    );
  }

  const sess = await mongoose.startSession();
  sess.startTransaction();
  place = await Place.findByIdAndDelete(pid, { session: sess }).populate(
    "creator"
  );
  await place.creator.places.pull(place);
  await place.creator.save({ session: sess });
  await sess.commitTransaction();

  // delete the image
  fs.unlink(place.image, (err) => console.log(err));

  return res.json({
    message: "Place deleted successfully!",
    place,
  });
});
