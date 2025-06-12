import mongoose, { Schema, Document } from "mongoose";

interface Attribute {
  name: string;
  values: string[];
}

interface IProduct extends Document {
  name: string;
  price: number;
  category: string;
  quantity: number;
  description: string[];
  image: string;
  attributes?: Attribute[];
}

const AttributeSchema = new Schema<Attribute>(
  {
    name: { type: String, required: true },
    values: { type: [String], required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  description: { type: [String], required: true },
  image: { type: String, required: true },
  attributes: { type: [AttributeSchema], default: [] },
});

export const ProductModel = mongoose.model<IProduct>(
  "Product",
  ProductSchema,
  "product"
);
