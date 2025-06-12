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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const express_1 = require("express");
const server_1 = require("../server");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
router.post("/images/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    const uploadStream = server_1.bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on("error", (error) => {
        res.status(500).json({ message: "Error uploading file", error });
    });
    uploadStream.on("finish", () => {
        res.status(201).json({
            imageUrl: `/api/v1/images/${uploadStream.id}`,
            filename: req.file.originalname,
        });
    });
});
router.get("/images/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const downloadStream = server_1.bucket.openDownloadStream(fileId);
        res.set("Content-Type", "image/jpeg"); // або динамічно — див. нижче
        downloadStream.on("error", () => {
            res.status(404).json({ message: "Image not found" });
        });
        downloadStream.pipe(res);
    }
    catch (error) {
        res.status(400).json({ message: "Invalid image ID", error });
    }
}));
exports.default = router;
