"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("./middlewares/cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const unsplashProxy_1 = __importDefault(require("./api/unsplashProxy"));
const aiGenerate_1 = __importDefault(require("./routes/aiGenerate"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const uploadsPath = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadsPath)) {
    fs_1.default.mkdirSync(uploadsPath, { recursive: true });
    console.log(`📁 Folder uploads otomatis dibuat di ${uploadsPath}`);
}
else {
    console.log(`📁 Folder uploads sudah ada di ${uploadsPath}`);
}
app.use(cors_1.default);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/uploads", express_1.default.static(uploadsPath));
app.use("/api/v1/unsplashProxy", unsplashProxy_1.default);
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/ai", aiGenerate_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📂 Akses file uploads: http://localhost:${PORT}/uploads`);
});
