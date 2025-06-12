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
const router = (0, express_1.Router)();
router.get("/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.query;
    const filter = type ? { type } : {};
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
exports.default = router;
