import express from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import corsMiddleware from "./middlewares/cors";
import authRouter from "./routes/auth";
import unsplashProxy from "./api/unsplashProxy";
import aiGenerateRoutes from "./routes/aiGenerate";

dotenv.config();
const app = express();

const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`📁 Folder uploads otomatis dibuat di ${uploadsPath}`);
} else {
  console.log(`📁 Folder uploads sudah ada di ${uploadsPath}`);
}

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`🛰️ ${req.method} ${req.url}`);
  next();
});

app.use("/uploads", express.static(uploadsPath));

app.use("/api/v1/unsplashProxy", unsplashProxy);
app.use("/api/v1/auth", authRouter);
console.log("✅ Auth router mounted di /api/v1/auth");
app.use("/api/v1/ai", aiGenerateRoutes);

console.log("🚀 Server init...");

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📂 Akses file uploads: http://localhost:${PORT}/uploads`);
});
