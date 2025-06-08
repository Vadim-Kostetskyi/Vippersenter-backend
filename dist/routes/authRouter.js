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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
router.post("/auth/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new User_1.default({ email, password: hashedPassword });
        yield newUser.save();
        res.status(201).json({ message: "User created successfully" });
        return;
    }
    catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ message: "Server error" });
        return;
    }
}));
router.post("/auth/login", (req, res, next) => {
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            return res
                .status(401)
                .json({ message: (info === null || info === void 0 ? void 0 : info.message) || "Unauthorized" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" });
        const _a = user, { password } = _a, userData = __rest(_a, ["password"]);
        const userObj = user.toObject();
        delete userObj.password;
        req.logIn(user, (err) => {
            if (err)
                return next(err);
            return res
                .status(200)
                .json({ message: "Login successful", userObj, token });
        });
    })(req, res, next);
});
exports.default = router;
