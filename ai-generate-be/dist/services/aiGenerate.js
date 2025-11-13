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
exports.generateAIService = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const openaiClient_1 = require("../utils/openaiClient");
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const CACHE_FILE = path_1.default.join(__dirname, "../../cache/ai_recommendations.json");
// TTL cache dalam milidetik (24 jam)
const CACHE_TTL = 24 * 60 * 60 * 1000;
if (!fs_1.default.existsSync(path_1.default.dirname(CACHE_FILE))) {
    fs_1.default.mkdirSync(path_1.default.dirname(CACHE_FILE), { recursive: true });
}
const readCache = () => {
    try {
        return JSON.parse(fs_1.default.readFileSync(CACHE_FILE, "utf-8"));
    }
    catch (_a) {
        return {};
    }
};
const writeCache = (data) => {
    fs_1.default.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
};
const generateCacheKey = (prompt, location) => {
    return crypto_1.default
        .createHash("md5")
        .update(`${prompt}_${location || ""}`)
        .digest("hex");
};
const isCacheValid = (entry) => {
    return Date.now() - entry.timestamp < CACHE_TTL;
};
const generateAIService = (prompt, location, image) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!prompt)
        throw new Error("Prompt wajib diisi");
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    let imageBase64 = null;
    if (image) {
        imageBase64 = image.buffer.toString("base64");
    }
    // PROMPT INTI
    const basePrompt = `
Kamu adalah asisten AI yang hanya memberikan rekomendasi restoran atau kuliner.

Jika pengguna menanyakan hal selain makanan, restoran, kuliner, atau tempat makan, balas dengan:
"Maaf, saya hanya bisa memberikan rekomendasi restoran atau kuliner."

Jika permintaan relevan, buatkan 5 rekomendasi restoran dengan rating minimal 4.4 berdasarkan deskripsi berikut:
"${prompt}"

- Gunakan lokasi ${location || "Indonesia"} jika pengguna tidak menyebut lokasi.
- Jika pengguna menyebutkan jenis makanan tradisional, pilih restoran terkenal dengan makanan tersebut.
${image ? "- Gunakan referensi dari gambar ini untuk memahami jenis makanan." : ""}
Keluarkan *output JSON murni tanpa teks tambahan*, dengan format seperti:
[
  {"name": "Nama restoran", "location": "Kota, Negara", "description": "Alasan direkomendasikan (Bahasa Indonesia)"}
]
`;
    const parseAIResponse = (content) => {
        const start = content.indexOf("[");
        const end = content.lastIndexOf("]");
        if (start !== -1 && end !== -1) {
            return JSON.parse(content.slice(start, end + 1));
        }
        throw new Error("Output bukan JSON valid");
    };
    const cacheKey = generateCacheKey(prompt, location);
    const cacheData = readCache();
    if (!image && cacheData[cacheKey] && isCacheValid(cacheData[cacheKey])) {
        console.log("⚡ Cache hit — hasil diambil dari cache");
        return { data: cacheData[cacheKey].data };
    }
    else if (!image && cacheData[cacheKey] && !isCacheValid(cacheData[cacheKey])) {
        console.log("🕒 Cache expired — hapus dan regenerasi");
        delete cacheData[cacheKey];
        writeCache(cacheData);
    }
    let data = [];
    try {
        const messages = [
            {
                role: "user",
                content: [{ type: "text", text: basePrompt }, ...(imageBase64 ? [{ type: "image_url", image_url: { url: `data:${image === null || image === void 0 ? void 0 : image.mimetype};base64,${imageBase64}` } }] : [])],
            },
        ];
        const completion = yield openaiClient_1.openai.chat.completions.create({
            model: "gpt-4o",
            messages,
        });
        const content = ((_b = (_a = completion.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.trim()) || "";
        if (content.toLowerCase().includes("maaf") && content.toLowerCase().includes("kuliner")) {
            return { data: [], message: "Maaf, saya hanya bisa memberikan rekomendasi restoran atau kuliner." };
        }
        data = parseAIResponse(content);
    }
    catch (error) {
        console.warn("⚠️ OpenAI gagal/limit — fallback ke Gemini:", error.message);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const inputParts = [{ text: basePrompt }];
            if (imageBase64) {
                inputParts.push({
                    inlineData: {
                        data: imageBase64,
                        mimeType: (image === null || image === void 0 ? void 0 : image.mimetype) || "image/jpeg",
                    },
                });
            }
            const result = yield model.generateContent({
                contents: [{ role: "user", parts: inputParts }],
            });
            const content = result.response.text().trim();
            if (content.toLowerCase().includes("maaf") && content.toLowerCase().includes("kuliner")) {
                return { data: [], message: "Maaf, saya hanya bisa memberikan rekomendasi restoran atau kuliner." };
            }
            data = parseAIResponse(content);
        }
        catch (geminiErr) {
            console.error("💥 Gemini juga gagal:", geminiErr);
            throw new Error("Gagal memproses permintaan dari kedua AI (OpenAI & Gemini).");
        }
    }
    // Enrich dengan Google Maps
    const enrichedData = yield Promise.all(data.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const query = `${item.name} ${item.location || location || "Indonesia"}`;
        if (!mapsApiKey) {
            return {
                name: item.name,
                location: item.location || location || "",
                description: item.description,
                googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
            };
        }
        try {
            const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${mapsApiKey}`;
            const searchRes = yield axios_1.default.get(searchUrl);
            const place = (_a = searchRes.data.results) === null || _a === void 0 ? void 0 : _a[0];
            if (!place)
                throw new Error("Restoran tidak ditemukan di Google Maps");
            const placeId = place.place_id;
            const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
            return {
                name: place.name,
                location: place.formatted_address,
                description: item.description,
                googleMapsUrl,
                imageUrl: ((_b = place.photos) === null || _b === void 0 ? void 0 : _b[0]) ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${mapsApiKey}` : undefined,
                rating: place.rating || undefined,
            };
        }
        catch (err) {
            console.warn("⚠️ Gagal ambil detail dari Google API:", err.message);
            return {
                name: item.name,
                location: item.location || location || "",
                description: item.description,
                googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
            };
        }
    })));
    if (!image) {
        cacheData[cacheKey] = {
            data: enrichedData,
            timestamp: Date.now(),
        };
        writeCache(cacheData);
        console.log("✅ Cache disimpan (TTL 24 jam)");
    }
    return { data: enrichedData };
});
exports.generateAIService = generateAIService;
