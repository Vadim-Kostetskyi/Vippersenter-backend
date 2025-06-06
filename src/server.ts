import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productsRouter from "./routes/products";
import { authenticateApiKey } from "./middlewares/authenticateApiKey";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI!);

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/v1", authenticateApiKey, productsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running`);
});
