"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadFile_1 = __importDefault(require("../middlewares/uploadFile"));
const aiGenerate_1 = require("../controllers/aiGenerate");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post("/generate", auth_1.authMiddleware, uploadFile_1.default.single("image"), aiGenerate_1.generateAI);
router.get("/history", auth_1.authMiddleware, aiGenerate_1.getAiHistory);
exports.default = router;
