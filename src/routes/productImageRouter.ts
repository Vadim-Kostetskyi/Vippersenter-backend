import multer from "multer";
import { Router } from "express";
import { bucket } from "../server";
import mongoose from "mongoose";

const router = Router();
const upload = multer();

router.post("/images/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const uploadStream = bucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
  });

  // Стрім з пам'яті multer файлу в GridFS
  uploadStream.end(req.file.buffer);

  uploadStream.on("error", (error) => {
    res.status(500).json({ message: "Error uploading file", error });
  });

  uploadStream.on("finish", () => {
    res.status(201).json({
      imageUrl: `/api/v1/images/${uploadStream.id}`, // айдішник файлу у GridFS
      filename: req.file!.originalname,
    });
  });
});

router.get("/images/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const downloadStream = bucket.openDownloadStream(fileId);

    res.set("Content-Type", "image/jpeg"); // або динамічно — див. нижче

    downloadStream.on("error", () => {
      res.status(404).json({ message: "Image not found" });
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(400).json({ message: "Invalid image ID", error });
  }
});

export default router;
