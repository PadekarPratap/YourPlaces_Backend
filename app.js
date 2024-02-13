import express from "express";
import "dotenv/config.js";

import placesRouter from "./routes/places-routes.js";
import usersRouter from "./routes/users-routes.js";
import HttpError from "./models/http-error.js";
import mongoose from "mongoose";

const app = express();

// to parse req.body
app.use(express.json());

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
