import express from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import corsMiddleware from "./middlewares/cors";
import authRouter from "./routes/auth";

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
app.use("/uploads", express.static(uploadsPath));

app.use("/api/v1/auth", authRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📂 Akses file uploads: http://localhost:${PORT}/uploads`);
});
