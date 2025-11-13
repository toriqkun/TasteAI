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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const query = req.query.query;
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey)
        return res.status(500).json({ error: "Unsplash key not found" });
    try {
        const resp = yield axios_1.default.get(`https://api.unsplash.com/search/photos`, {
            params: { query, per_page: 1 },
            headers: { Authorization: `Client-ID ${accessKey}` },
        });
        const imageUrl = (_c = (_b = (_a = resp.data.results) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.urls) === null || _c === void 0 ? void 0 : _c.regular;
        if (!imageUrl)
            throw new Error("Image not found");
        res.json({ imageUrl });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
