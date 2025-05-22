import express from "express";
import "dotenv/config.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

const app = express();

app.use(express.json());
app.use(cors());
// job.start(); // for cron job

// Routes
app.get("/", (req, res) => {
  res.status(200).send({ success: true });
});
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);

  connectDB();
});
