import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
    address: {
      required: true,
      type: String,
    },
    location: {
      lat: {
        required: true,
        type: Number,
      },
      lng: {
        required: true,
        type: Number,
      },
    },
    image: {
      required: true,
      type: String,
    },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Place", placeSchema);
