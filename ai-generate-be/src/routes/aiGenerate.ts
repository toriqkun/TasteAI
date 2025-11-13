import { Router } from "express";
import upload from "../middlewares/uploadFile";
import { generateAI, getAiHistory } from "../controllers/aiGenerate";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/generate", authMiddleware, upload.single("image"), generateAI);
router.get("/history", authMiddleware, getAiHistory);

export default router;
