import { Router } from "express";
import { ProductModel } from "../models/Product";

const router = Router();

router.get("/products", async (req, res) => {
  const { type } = req.query;
  const filter = type ? { type } : {};
  const products = await ProductModel.find(filter);

  const transformedProducts = products.map((product) => {
    if (
      product.attributes &&
      !Array.isArray(product.attributes) &&
      typeof product.attributes === "object"
    ) {
      const attributesObj = product.attributes;
      const converted = Object.entries(attributesObj)
        .filter(([_, values]) => Array.isArray(values))
        .map(([name, values]) => ({
          name,
          values: values as string[],
        }));
      return {
        ...product.toObject(),
        attributes: converted,
      };
    }

    return product;
  });

  res.json(transformedProducts);
});

router.post("/products", async (req, res) => {
  try {
    const newProduct = new ProductModel(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to create a product", details: error });
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    let transformedProduct = product.toObject();

    if (
      product.attributes &&
      !Array.isArray(product.attributes) &&
      typeof product.attributes === "object"
    ) {
      const attributesObj = product.attributes;
      const converted = Object.entries(attributesObj)
        .filter(([_, values]) => Array.isArray(values))
        .map(([name, values]) => ({
          name,
          values: values as string[],
        }));
      transformedProduct.attributes = converted;
    }

    res.json(transformedProduct);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error });
  }
});

export default router;
