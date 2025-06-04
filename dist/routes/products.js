import { Router } from "express";
import { ProductModel } from "../models/Product";
const router = Router();
router.get("/products", async (req, res) => {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const products = await ProductModel.find(filter);
    res.json(products);
});
export default router;
