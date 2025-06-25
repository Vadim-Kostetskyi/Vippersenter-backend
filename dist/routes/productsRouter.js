"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Product_1 = require("../models/Product");
const queryFilterBuilder_1 = require("../utils/queryFilterBuilder");
const Order_1 = require("../models/Order");
const router = (0, express_1.Router)();
router.get("/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, random, newProduct, popularProduct, category, search } = req.query;
    try {
        const filter = (0, queryFilterBuilder_1.buildProductFilter)(req.query);
        if (random === "true") {
            const matchStage = {};
            const products = yield Product_1.ProductModel.aggregate([
                { $match: matchStage },
                { $sample: { size: 3 } },
            ]);
            res.json(products);
            return;
        }
        const products = yield Product_1.ProductModel.find(filter);
        const transformedProducts = products.map((product) => {
            if (product.attributes &&
                !Array.isArray(product.attributes) &&
                typeof product.attributes === "object") {
                const attributesObj = product.attributes;
                const converted = Object.entries(attributesObj)
                    .filter(([_, values]) => Array.isArray(values))
                    .map(([name, values]) => ({
                    name,
                    values: values,
                }));
                return Object.assign(Object.assign({}, product.toObject()), { attributes: converted });
            }
            return product;
        });
        res.json(transformedProducts);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch products", details: error });
    }
}));
router.get("/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = (0, queryFilterBuilder_1.buildProductFilter)(req.query);
        if (req.query.random === "true") {
            const products = yield Product_1.ProductModel.aggregate([
                { $match: {} },
                { $sample: { size: 3 } },
            ]);
            res.json(products);
            return;
        }
        const products = yield Product_1.ProductModel.find(filter);
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch products", details: error });
    }
}));
router.post("/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newProduct = new Product_1.ProductModel(req.body);
        const savedProduct = yield newProduct.save();
        res.status(201).json(savedProduct);
    }
    catch (error) {
        res
            .status(400)
            .json({ error: "Failed to create a product", details: error });
    }
}));
router.patch("/products/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quantity, attributeName } = req.body;
        if (typeof quantity !== "number" || quantity < 0) {
            return res.status(400).json({ error: "Invalid quantity" });
        }
        if (typeof attributeName !== "string" || attributeName.trim() === "") {
            return res.status(400).json({ error: "Invalid attributeName" });
        }
        // Знаходимо продукт за id
        const product = yield Product_1.ProductModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        // Знаходимо атрибут і його значення з потрібним attributeName
        let updated = false;
        product.attributes.forEach((attr) => {
            attr.values.forEach((val) => {
                if (val.attributeName === attributeName) {
                    val.quantity = quantity; // Оновлюємо кількість
                    updated = true;
                }
            });
        });
        if (!updated) {
            return res.status(404).json({ error: "Attribute value not found" });
        }
        yield product.save();
        res.json(product);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Failed to update quantity", details: error.message });
    }
}));
router.delete("/products/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedProduct = yield Product_1.ProductModel.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete product", details: error });
    }
}));
router.post("/order/place", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items, totalPrice } = req.body;
        if (!items || !Array.isArray(items) || typeof totalPrice !== "number") {
            res.status(400).json({ error: "Invalid request body" });
            return;
        }
        for (const item of items) {
            const product = yield Product_1.ProductModel.findById(item.productId);
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
            yield product.save();
        }
        const newOrder = new Order_1.OrderModel({
            items,
            totalPrice,
            createdAt: new Date(),
        });
        yield newOrder.save();
        res
            .status(200)
            .json({ success: true, message: "Order placed successfully" });
    }
    catch (error) {
        console.error("Order error:", error);
        res.status(500).json({ error: "Server error" });
    }
}));
router.get("/product/slug/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.ProductModel.findOne({ slug: req.params.slug });
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        // let transformedProduct = product.toObject();
        // if (
        //   product.attributes &&
        //   !Array.isArray(product.attributes) &&
        //   typeof product.attributes === "object"
        // ) {
        //   const attributesObj = product.attributes as Record<string, unknown>;
        //   const converted = Object.entries(attributesObj)
        //     .filter(([_, values]) => Array.isArray(values))
        //     .map(([name, values]) => ({
        //       name,
        //       values: values as string[],
        //     }));
        //   transformedProduct.attributes = converted;
        // }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error });
    }
}));
exports.default = router;
