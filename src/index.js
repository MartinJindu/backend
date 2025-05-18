import express from "express";
import "dotenv/config.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);

  connectDB();
});
