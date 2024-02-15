import fs from "fs";

import express from "express";
import "dotenv/config.js";
import cors from "cors";

import placesRouter from "./routes/places-routes.js";
import usersRouter from "./routes/users-routes.js";
import HttpError from "./models/http-error.js";
import mongoose from "mongoose";

const app = express();

// to parse req.body
app.use(express.json());

// to handle CORS errors
app.use(cors());

// to server static images
app.use("/uploads/images", express.static("uploads/images"));

// places routes
app.use("/api/places", placesRouter);
// users routes
app.use("/api/users", usersRouter);

// unsupported routes
app.use((req, res, next) => {
  return next(
    new HttpError(
      "Could not find this route. Make sure you have the correct route",
      404
    )
  );
});

// error handling middleware
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => console.log(err));
  }

  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknow error occured." });
});

// connecting to DB and starting server
mongoose
  .connect(process.env.CONNECT_URI)
  .then(() =>
    app.listen(process.env.PORT, () =>
      console.log(`Server started on port ${process.env.PORT}`)
    )
  )
  .catch((err) => console.log(err.message));
