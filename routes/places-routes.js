import express from "express";
import { check } from "express-validator";
import {
  createPlace,
  deletePlace,
  getPlaceById,
  getPlacesByUserId,
  updatePlace,
} from "../controllers/places-controllers.js";

const router = express.Router();

router.get("/:pid", getPlaceById);

router.get("/user/:uid", getPlacesByUserId);

router.post(
  "/",
  [
    check("title", "Title cannot be empty").not().isEmpty(),
    check("description", "Description must be atleast 5 chars.").isLength({
      min: 5,
    }),
    check("address", "Address field cannot be empty").not().isEmpty(),
  ],
  createPlace
);

router.patch(
  "/:pid",
  [
    check("title", "Title cannot be empty").not().isEmpty(),
    check("description", "Description must be atleast 5 chars.").isLength({
      min: 5,
    }),
  ],
  updatePlace
);

router.delete("/:pid", deletePlace);

export default router;
