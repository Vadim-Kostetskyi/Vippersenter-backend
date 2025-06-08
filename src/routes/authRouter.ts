import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
    return;
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Server error" });
    return;
  }
});

router.post(
  "/auth/login",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: any,
        user: Express.User | false,
        info: { message?: string } | undefined
      ) => {
        if (err) return next(err);
        if (!user) {
          return res
            .status(401)
            .json({ message: info?.message || "Unauthorized" });
        }

        const token = jwt.sign(
          { id: (user as any)._id, email: (user as any).email },
          process.env.JWT_SECRET || "default_secret",
          { expiresIn: "7d" }
        );

        const { password, ...userData } = user as any;

        const userObj = user.toObject();
        delete userObj.password;

        req.logIn(user, (err) => {
          if (err) return next(err);
          return res
            .status(200)
            .json({ message: "Login successful", userObj, token });
        });
      }
    )(req, res, next);
  }
);

export default router;
