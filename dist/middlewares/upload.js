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
exports.uploadToGCS = exports.upload = void 0;
const storage_1 = require("@google-cloud/storage");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
const gc = new storage_1.Storage({
    keyFilename: path_1.default.join(__dirname, "../../gcs-key.json"),
    projectId: process.env.GCLOUD_PROJECT_ID,
});
const bucket = gc.bucket(process.env.GCS_BUCKET_NAME);
// Створюємо middleware
const storage = multer_1.default.memoryStorage(); // зберігаємо файл в оперативці тимчасово
const imageFilter = (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|jpg|gif)$/)) {
        cb(new Error("Only image files are allowed!"), false);
    }
    else {
        cb(null, true);
    }
};
exports.upload = (0, multer_1.default)({ storage, fileFilter: imageFilter });
// Завантаження в GCS
const uploadToGCS = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const blob = bucket.file(`${(0, uuid_1.v4)()}-${file.originalname}`);
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
});
exports.uploadToGCS = uploadToGCS;
