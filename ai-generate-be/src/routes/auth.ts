import express from "express";
import { register, verifyEmail, login, logout, profile, updateProfile } from "../controllers/auth";
import { authMiddleware } from "../middlewares/auth";
import upload from "../middlewares/uploadFile";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", verifyEmail);
router.post("/logout", logout);
router.get("/profile", authMiddleware, profile);
router.put("/profile", authMiddleware, upload.single("avatarImage"), updateProfile);

export default router;
