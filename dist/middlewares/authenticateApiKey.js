"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateApiKey = authenticateApiKey;
function authenticateApiKey(req, res, next) {
    if (req.method === "OPTIONS") {
        return next();
    }
    const authHeader = req.headers["authorization"];
    if (!authHeader || authHeader !== `Bearer ${process.env.API_KEY}`) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    next();
}
