import mongoose, { Schema, Document } from "mongoose";

interface IProduct extends Document {
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  tags: string[];
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  inStock: { type: Boolean, required: true },
  tags: { type: [String], required: true },
});

export const ProductModel = mongoose.model<IProduct>(
  "Product",
  ProductSchema,
  "product"
);
