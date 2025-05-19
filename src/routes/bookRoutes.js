import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (res, req) => {
  try {
    const { title, caption, rating, image } = req.body;

    // validating inputs from frontend
    if (!title || !caption || !rating || !image) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // Upload the image to cloudinary
    const imgUploadResponse = await cloudinary.uploader.upload(image);
    const imgUrl = imgUploadResponse.secure_url;

    // saving to DB
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imgUrl,
      user: req.user._id,
    });

    await newBook.save();

    res.status(201).json({ newBook });
  } catch (error) {
    console.log("Error creating book", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
