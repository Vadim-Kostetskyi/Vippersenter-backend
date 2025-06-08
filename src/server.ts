import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "./config/config-passport";
import authRouter from "./routes/authRouter";

import productsRouter from "./routes/products";
import { authenticateApiKey } from "./middlewares/authenticateApiKey";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const dbHost = process.env.MONGO_URI!;
mongoose
  .connect(dbHost)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

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
app.use("/api/v1", authenticateApiKey, productsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running`);
});
