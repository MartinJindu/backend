import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
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

router.get("/", protectRoute, async (req, res) => {
  // getting book with pagination or infinite scroll
  // e.g of request from frontend = localhost:3000/api/books?page=2&limit=5
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 }) //desc order
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    // total number of book in db
    const totalBooks = await Book.countDocuments();

    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in getting book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user", protectRoute, async (req, res) => {
  // get books by the current user
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (error) {
    console.log("Get user books error", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

    // check if user is owner/creator
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // delete image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      // https://res.cloudinary.com/de1re4uto/image/upload/v145637456/qweuif4873hgsjh373d.png

      // e.g of cloudinary img url. the publicId is the one at the end i.e qweuif4873hgsjh373d.png

      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Error deleting image from cloudinary");
      }
    }

    // delete book in db
    await book.deleteOne();

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
