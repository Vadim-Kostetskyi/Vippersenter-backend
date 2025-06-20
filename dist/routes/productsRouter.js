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
router.get("/product/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.ProductModel.findById(req.params.id);
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        let transformedProduct = product.toObject();
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
            transformedProduct.attributes = converted;
        }
        res.json(transformedProduct);
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error });
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
        const { quantity } = req.body;
        if (typeof quantity !== "number" || quantity < 0) {
            res.status(400).json({ error: "Invalid quantity" });
            return;
        }
        const updatedProduct = yield Product_1.ProductModel.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
        if (!updatedProduct) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.json(updatedProduct);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Failed to update quantity", details: error });
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
        console.log("Order total price:", totalPrice);
        res
            .status(200)
            .json({ success: true, message: "Order placed successfully" });
    }
    catch (error) {
        console.error("Order error:", error);
        res.status(500).json({ error: "Server error" });
    }
}));
exports.default = router;
