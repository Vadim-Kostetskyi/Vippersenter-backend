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
            console.log("random:", products);
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
exports.default = router;
