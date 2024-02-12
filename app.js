import express from "express";
import bodyParser from "body-parser";

import placesRouter from "./routes/places-routes.js";
import usersRouter from "./routes/users-routes.js";
import HttpError from "./models/http-error.js";

const app = express();

// to parse req.body
app.use(bodyParser.json());

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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
