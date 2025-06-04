"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const products_1 = __importDefault(require("./routes/products"));
const authenticateApiKey_1 = require("./middlewares/authenticateApiKey");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
mongoose_1.default.connect(process.env.MONGO_URI);
const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use("/api/v1", authenticateApiKey_1.authenticateApiKey, products_1.default);
app.listen(PORT, () => {
    console.log(`🚀 Server running`);
});
