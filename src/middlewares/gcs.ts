// src/middlewares/gcs.ts
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import path from "path";
import { Request } from "express";
import dotenv from "dotenv";

dotenv.config();

// Ініціалізація клієнта GCS
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: path.join(__dirname, "../../gcs-key.json"), // або шлях до .json ключа
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

// Multer Storage
const multerStorage = multer.memoryStorage();

const upload = multer({ storage: multerStorage });

async function uploadToGCS(
  fileBuffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const blob = bucket.file(filename);
  const stream = blob.createWriteStream({
    resumable: false,
    contentType: mimetype,
    public: true,
  });

  return new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });
    stream.end(fileBuffer);
  });
}

export { upload, uploadToGCS };
