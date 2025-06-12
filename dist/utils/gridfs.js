"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gfs = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let gfs;
mongoose_1.default.connection.once("open", () => {
    const db = mongoose_1.default.connection.db;
    if (db) {
        exports.gfs = gfs = new mongoose_1.default.mongo.GridFSBucket(db, { bucketName: "uploads" });
        console.log("GridFSBucket initialized");
    }
    else {
        console.error("MongoDB connection db is undefined");
    }
});
