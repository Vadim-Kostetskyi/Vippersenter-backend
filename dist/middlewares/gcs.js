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
exports.upload = void 0;
exports.uploadToGCS = uploadToGCS;
// src/middlewares/gcs.ts
const multer_1 = __importDefault(require("multer"));
const storage_1 = require("@google-cloud/storage");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Ініціалізація клієнта GCS
const storage = new storage_1.Storage({
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: path_1.default.join(__dirname, "../../gcs-key.json"), // або шлях до .json ключа
});
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
// Multer Storage
const multerStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: multerStorage });
exports.upload = upload;
function uploadToGCS(fileBuffer, filename, mimetype) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
//del
