import mongoose, { Schema } from "mongoose";
const ProductSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, required: true },
    tags: { type: [String], required: true },
});
export const ProductModel = mongoose.model("Product", ProductSchema, "product");
