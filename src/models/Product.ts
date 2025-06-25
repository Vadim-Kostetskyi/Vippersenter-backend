import mongoose, { Schema, Document } from "mongoose";

interface AttributeValue {
  attributeName: string;
  extraPrice: string;
  quantity: number;
}

interface Attribute {
  name: string;
  values: AttributeValue[];
}

interface IProduct extends Document {
  name: string;
  price: number;
  category: string;
  quantity: number;
  description: string[];
  image: string;
  attributes?: Attribute[];
  newProduct?: boolean;
  popularProduct?: boolean;
  slug?: string;
}

const AttributeValueSchema = new Schema<AttributeValue>(
  {
    attributeName: { type: String, required: true },
    extraPrice: { type: String, default: "0" },
    quantity: { type: Number, default: 0 },
  },
  { _id: false }
);

const AttributeSchema = new Schema<Attribute>(
  {
    name: { type: String, required: true },
    values: { type: [AttributeValueSchema], required: true },
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
  newProduct: { type: Boolean },
  popularProduct: { type: Boolean },
  slug: { type: String, unique: true, sparse: true },
});

export const ProductModel = mongoose.model<IProduct>(
  "Product",
  ProductSchema,
  "product"
);
