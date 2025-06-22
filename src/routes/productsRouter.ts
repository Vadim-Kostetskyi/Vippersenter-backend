import { Router } from "express";
import { ProductModel } from "../models/Product";
import { buildProductFilter } from "../utils/queryFilterBuilder";
import { OrderModel } from "../models/Order";

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

router.patch("/products/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== "number" || quantity < 0) {
      res.status(400).json({ error: "Invalid quantity" });
      return;
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );

    if (!updatedProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(updatedProduct);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update quantity", details: error });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product", details: error });
  }
});

router.post("/order/place", async (req, res) => {
  try {
    const { items, totalPrice } = req.body;

    if (!items || !Array.isArray(items) || typeof totalPrice !== "number") {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        res.status(404).json({ error: `Product ${item.productId} not found` });
        return;
      }

      if (product.quantity < item.quantity) {
        res.status(400).json({
          error: `Not enough stock for ${product.name}. Available: ${product.quantity}`,
        });
        return;
      }

      product.quantity -= item.quantity;
      await product.save();
    }

    const newOrder = new OrderModel({
      items,
      totalPrice,
      createdAt: new Date(),
    });
    await newOrder.save();

    res
      .status(200)
      .json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/product/slug/:slug", async (req, res) => {
  try {
    const product = await ProductModel.findOne({ slug: req.params.slug });
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
      const attributesObj = product.attributes as Record<string, unknown>;
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
