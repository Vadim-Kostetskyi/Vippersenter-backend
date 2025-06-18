import { Router } from "express";
import { ProductModel } from "../models/Product";
import { buildProductFilter } from "../utils/queryFilterBuilder";

const router = Router();

router.get("/products", async (req, res) => {
  const { type, random, newProduct, popularProduct, category, search } =
    req.query;

  try {
    const filter = buildProductFilter(req.query);

    if (random === "true") {
      const matchStage: any = {};
      const products = await ProductModel.aggregate([
        { $match: matchStage },
        { $sample: { size: 3 } },
      ]);
      console.log("random:", products);

      res.json(products);
      return;
    }

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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products", details: error });
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
