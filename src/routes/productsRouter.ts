import { Router } from "express";
import { ProductModel } from "../models/Product";

const router = Router();

router.get("/products", async (req, res) => {
  const { type } = req.query;
  const filter = type ? { type } : {};
  const products = await ProductModel.find(filter);
  res.json(products);
});

router.post("/products", async (req, res) => {
  console.log(111);

  try {
    const newProduct = new ProductModel(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to create a product", details: error });
    console.log("POST body:", req.body);
  }
});

export default router;
