import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "./config/config-passport";
import authRouter from "./routes/authRouter";
import productsRouter from "./routes/productsRouter";
import imageRouter from "./routes/productImageRouter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const dbHost = process.env.MONGO_URI!;
mongoose
  .connect(dbHost)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

export let bucket: mongoose.mongo.GridFSBucket;

(() => {
  mongoose.connection.on("connected", () => {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, {
      bucketName: "image",
    });
  });
})();

const allowedOrigins = [
  "http://localhost:3000",
  "https://vippersenter.no",
  "http://localhost:5173",
  "https://vippersenter-2gzyklopx-vadim-kostetskyis-projects.vercel.app",
  "https://vippersenter-git-main-vadim-kostetskyis-projects.vercel.app",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: any, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("/{*splat}", cors(corsOptions));

app.use(
  session({
    secret: "secret-word",
    name: "session-id",
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
    saveUninitialized: false,
    resave: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use("/api/v1", authRouter);
app.use("/api/v1", imageRouter);
app.use("/api/v1", productsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running`);
});
