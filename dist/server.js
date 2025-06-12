"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
require("./config/config-passport");
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const productsRouter_1 = __importDefault(require("./routes/productsRouter"));
const productImageRouter_1 = __importDefault(require("./routes/productImageRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const dbHost = process.env.MONGO_URI;
mongoose_1.default
    .connect(dbHost)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
(() => {
    mongoose_1.default.connection.on("connected", () => {
        exports.bucket = new mongoose_1.default.mongo.GridFSBucket(mongoose_1.default.connection.db, {
            bucketName: "image",
        });
    });
})();
const allowedOrigins = [
    "http://localhost:5173",
    "https://vippersenter-2gzyklopx-vadim-kostetskyis-projects.vercel.app",
    "https://vippersenter-git-main-vadim-kostetskyis-projects.vercel.app",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
    ],
};
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions));
app.use((0, express_session_1.default)({
    secret: "secret-word",
    name: "session-id",
    cookie: {
        path: "/",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
    },
    saveUninitialized: false,
    resave: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_1.default.json());
app.use("/api/v1", authRouter_1.default);
app.use("/api/v1", productImageRouter_1.default);
app.use("/api/v1", productsRouter_1.default);
app.listen(PORT, () => {
    console.log(`🚀 Server running`);
});
