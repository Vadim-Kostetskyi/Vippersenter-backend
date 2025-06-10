import { Router } from "express";
import mongoose from "mongoose";
import { ProductModel } from "../models/Product";
import { upload } from "../middlewares/upload";
import { GridFSBucket } from "mongodb";
import { gfs } from "../utils/gridfs";

const router = Router();

router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, quantity, description } = req.body;

    const product = new ProductModel({
      name,
      price,
      category,
      quantity,
      description,
      image: req.file?.filename,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Помилка при створенні продукту:", error);
    res.status(500).json({ error: "Не вдалося створити продукт" });
  }
});

router.get("/products/image/:filename", async (req, res) => {
  if (!gfs) {
    res.status(500).json({ error: "GridFS не ініціалізовано" });
    return;
  }

  try {
    const files = await gfs.find({ filename: req.params.filename }).toArray();

    if (!files || files.length === 0) {
      res.status(404).json({ error: "Файл не знайдено" });
      return;
    }

    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка при завантаженні файлу" });
  }
});

export default router;
