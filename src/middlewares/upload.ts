import { Storage } from "@google-cloud/storage";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { Multer } from "multer";

dotenv.config();

const gc = new Storage({
  keyFilename: path.join(__dirname, "../../gcs-key.json"),
  projectId: process.env.GCLOUD_PROJECT_ID,
});

const bucket = gc.bucket(process.env.GCS_BUCKET_NAME!);

// Створюємо middleware
const storage = multer.memoryStorage(); // зберігаємо файл в оперативці тимчасово

const imageFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpeg|png|jpg|gif)$/)) {
    cb(new Error("Only image files are allowed!"), false);
  } else {
    cb(null, true);
  }
};

export const upload: Multer = multer({ storage, fileFilter: imageFilter });

// Завантаження в GCS
export const uploadToGCS = async (
  file: Express.Multer.File
): Promise<string> => {
  const blob = bucket.file(`${uuidv4()}-${file.originalname}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", (err) => reject(err));

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

//del
