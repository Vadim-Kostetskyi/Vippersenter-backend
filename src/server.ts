import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productsRouter from "./routes/products";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI!);

app.use(cors());
app.use(express.json());
app.use("/api/v1", productsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running`);
});
