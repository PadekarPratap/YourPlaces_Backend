import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  loginUser,
} from "../controllers/users-controllers.js";
import { check } from "express-validator";

const router = express.Router();

router.get("/", getAllUsers);

router.post(
  "/signup",
  [
    check("email", "Invalid Email").normalizeEmail().isEmail(),
    check("username", "username cannot be empty").not().isEmpty(),
    check("password", "password must have minimum 8 chars.").isLength({
      min: 8,
    }),
  ],
  createUser
);

router.post("/login", loginUser);

router.delete("/:uid", deleteUser);

export default router;
