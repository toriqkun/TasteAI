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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiHistory = exports.generateAI = void 0;
const aiGenerate_1 = require("../services/aiGenerate");
const client_1 = __importDefault(require("../prisma/client"));
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const generateAI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { prompt, location } = req.body;
        const image = req.file;
        if (!prompt) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Prompt wajib diisi",
            });
        }
        let imageUrl = null;
        if (image) {
            yield new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ folder: "ai_generate" }, (error, result) => {
                    if (error)
                        return reject(error);
                    imageUrl = (result === null || result === void 0 ? void 0 : result.secure_url) || null;
                    resolve();
                });
                stream.end(image.buffer);
            });
        }
        const result = yield (0, aiGenerate_1.generateAIService)(prompt, location, image);
        const formattedResult = result.data.map((item) => {
            var _a;
            return ({
                name: item.name,
                location: item.location,
                description: item.description,
                googleMapsUrl: item.googleMapsUrl,
                imageUrl: item.imageUrl || null,
                rating: (_a = item.rating) !== null && _a !== void 0 ? _a : null,
            });
        });
        if (result.message) {
            return res.status(200).json({
                code: 200,
                status: "warning",
                message: result.message,
                data: [],
            });
        }
        yield client_1.default.aiGeneration.create({
            data: {
                userId,
                prompt,
                location: location || null,
                imageUrl,
                result: formattedResult,
            },
        });
        return res.status(200).json({
            code: 200,
            status: "success",
            message: "AI generation success",
            data: formattedResult,
        });
    }
    catch (err) {
        console.error("❌ generateAI error:", err);
        return res.status(500).json({
            code: 500,
            status: "error",
            message: err.message || "Gagal melakukan generate",
        });
    }
});
exports.generateAI = generateAI;
const getAiHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                code: 401,
                status: "error",
                message: "Unauthorized: user tidak ditemukan",
            });
        }
        const history = yield client_1.default.aiGeneration.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                prompt: true,
                location: true,
                imageUrl: true,
                result: true,
                createdAt: true,
            },
        });
        return res.status(200).json({
            code: 200,
            status: "success",
            data: history,
        });
    }
    catch (err) {
        console.error("❌ getAiHistory error:", err);
        res.status(500).json({
            code: 500,
            status: "error",
            message: err.message || "Gagal mengambil riwayat generate",
        });
    }
});
exports.getAiHistory = getAiHistory;
