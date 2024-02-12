import { validationResult } from "express-validator";
import HttpError from "../models/http-error.js";
import { addressToCoordinates } from "../utils/location.js";

// dummy data
let DUMMY_PLACES = [
  {
    id: 1,
    title: "Empire State Building",
    description: "Great building",
    address: "nine street view",
    location: {
      lat: 1254,
      lng: 154156,
    },
    creator: 32,
  },
];

export const getPlaceById = (req, res, next) => {
  const { pid } = req.params;

  const place = DUMMY_PLACES.find((place) => place.id === parseInt(pid));

  if (!place) return next(new HttpError("Place could not be found", 404));

  return res.json({ place });
};

export const getPlacesByUserId = (req, res, next) => {
  const { uid } = req.params;

  const places = DUMMY_PLACES.filter(
    (place) => place.creator === parseInt(uid)
  );

  if (places.length === 0)
    return next(new HttpError("Place could not be found for the user", 404));

  return res.json({ user: places });
};

export const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return res.status(422).json({ Error: error.array() });

  const { title, description, address, creator } = req.body;

  let location;
  try {
    location = await addressToCoordinates(address);
  } catch (err) {
    return next(
      new HttpError("Invalid Address. No Co-ordinates could be found!", 404)
    );
  }

  const newPlace = {
    title,
    description,
    location,
    address,
    creator,
  };

  DUMMY_PLACES.push(newPlace);

  return res.status(201).json({
    message: "New Place created!",
    place: newPlace,
  });
};

export const updatePlace = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return res.status(422).json({ Error: error.array() });

  const { pid } = req.params;
  const { title, description } = req.body;

  const updatedPlace = DUMMY_PLACES.find((place) => place.id === parseInt(pid));

  updatedPlace.title = title;
  updatedPlace.description = description;

  return res
    .status(200)
    .json({ message: "Place updated successfully!", place: updatedPlace });
};

export const deletePlace = (req, res, next) => {
  const { pid } = req.params;

  DUMMY_PLACES = DUMMY_PLACES.filter((place) => place.id !== parseInt(pid));

  return res.status(200).json({ message: "Place deleted successfully!" });
};
