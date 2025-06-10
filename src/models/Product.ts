import mongoose, { Schema, Document } from "mongoose";

interface IProduct extends Document {
  name: string;
  price: number;
  category: string;
  quantity: number;
  description: string[];
  image: string;
  attributes?: {
    lines?: string[];
    curl?: string[];
    length?: string[];
    thickness?: string[];
  };
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  description: { type: [String], required: true },
  image: { type: String, required: true },
  attributes: {
    lines: [String],
    curl: [String],
    length: [String],
    thickness: [String],
  },
});

export const ProductModel = mongoose.model<IProduct>(
  "Product",
  ProductSchema,
  "product"
);
