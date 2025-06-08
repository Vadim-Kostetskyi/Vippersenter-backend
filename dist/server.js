"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
require("./config/config-passport");
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const products_1 = __importDefault(require("./routes/products"));
const authenticateApiKey_1 = require("./middlewares/authenticateApiKey");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const dbHost = process.env.MONGO_URI;
mongoose_1.default
    .connect(dbHost)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
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
app.use("/api/v1", authenticateApiKey_1.authenticateApiKey, products_1.default);
app.listen(PORT, () => {
    console.log(`🚀 Server running`);
});
