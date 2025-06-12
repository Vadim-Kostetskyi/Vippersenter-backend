import mongoose from "mongoose";

let gfs: mongoose.mongo.GridFSBucket;

mongoose.connection.once("open", () => {
  const db = mongoose.connection.db;
  if (db) {
    gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });
  } else {
    console.error("MongoDB connection db is undefined");
  }
});

export { gfs };
