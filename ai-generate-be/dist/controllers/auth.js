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
exports.updateProfile = exports.profile = exports.logout = exports.login = exports.verifyEmail = exports.register = void 0;
const joi_1 = __importDefault(require("joi"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = __importDefault(require("../prisma/client"));
const generateToken_1 = require("../utils/generateToken");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const streamifier_1 = __importDefault(require("streamifier"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(4).max(20).required().messages({
        "string.empty": "Nama lengkap wajib diisi",
        "string.min": "Nama minimal 4 karakter",
        "string.max": "Nama maksimal 20 karakter",
    }),
    email: joi_1.default.string().email().required().messages({
        "string.empty": "Email wajib diisi",
        "string.email": "Format email tidak valid",
    }),
    password: joi_1.default.string().min(8).required().messages({
        "string.empty": "Password wajib diisi",
        "string.min": "Password minimal 8 karakter",
    }),
    confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).required().messages({
        "any.only": "Konfirmasi password tidak cocok",
        "any.required": "Konfirmasi password wajib diisi",
    }),
});
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// REGISTER
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = registerSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: "Validasi gagal",
                errors: error.details.map((d) => d.message),
            });
        }
        const { name, email, password } = req.body;
        const existingUser = yield client_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield client_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isVerified: false,
            },
        });
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
        yield client_1.default.verificationToken.create({
            data: {
                token,
                userId: newUser.id,
                expiresAt,
            },
        });
        const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
        yield transporter.sendMail({
            from: `"TasteAI Auth" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your email",
            html: `<p>Hello ${name},</p>
             <p>Please verify your account by clicking link below:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>
             <p>This link will expire in 1 hour.</p>`,
        });
        res.status(201).json({
            message: "Registrasi berhasil",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.register = register;
// VERIFY EMAIL
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        const foundToken = yield client_1.default.verificationToken.findUnique({
            where: { token: String(token) },
            include: { user: true },
        });
        if (!foundToken) {
            return res.status(400).json({ message: "Token tidak valid" });
        }
        if (foundToken.expiresAt < new Date()) {
            return res.status(400).json({ message: "Token sudah expired" });
        }
        yield client_1.default.user.update({
            where: { id: foundToken.userId },
            data: { isVerified: true },
        });
        const updatedUser = yield client_1.default.verificationToken.delete({ where: { id: foundToken.id } });
        console.log("User setelah verifikasi:", updatedUser);
        res.json({ message: "Email berhasil diverifikasi, silakan login." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.verifyEmail = verifyEmail;
// LOGIN
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({}),
    password: joi_1.default.string().min(8).required().messages({}),
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error)
            return res.status(400).json({ message: error.message });
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email atau password salah" });
        }
        const user = yield client_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ message: "Email atau password salah" });
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword)
            return res.status(401).json({ message: "Email atau password salah" });
        if (!user.isVerified) {
            return res.status(403).json({ message: "Email belum diverifikasi, silakan periksa kotak masuk Anda." });
        }
        const token = (0, generateToken_1.generateToken)({ id: user.id, email: user.email });
        res.cookie("token_user_tasteai", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000, // 1 hari
        });
        res.json({
            message: "Login berhasil",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.login = login;
// LOGOUT
const logout = (req, res) => {
    res.clearCookie("token_user_tasteai", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
    res.json({ message: "Logout berhasil" });
};
exports.logout = logout;
// PROFILE
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield client_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatarImage: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "User tidak ditemukan",
            });
        }
        res.json({
            code: 200,
            status: "success",
            message: "Berhasil mengambil data profile.",
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Gagal mengambil data profile",
        });
    }
});
exports.profile = profile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        const file = req.file;
        let avatarUrl;
        if (file) {
            const uploadPromise = new Promise((resolve, reject) => {
                const upload = cloudinary_1.default.uploader.upload_stream({ folder: "avatars", resource_type: "image" }, (error, result) => {
                    if (error)
                        return reject(error);
                    resolve(result);
                });
                streamifier_1.default.createReadStream(file.buffer).pipe(upload);
            });
            const result = yield uploadPromise;
            avatarUrl = result.secure_url;
        }
        const updatedUser = yield client_1.default.user.update({
            where: { id: userId },
            data: Object.assign({ name }, (avatarUrl && { avatarImage: avatarUrl })),
            select: {
                id: true,
                name: true,
                email: true,
                avatarImage: true,
            },
        });
        res.json({
            code: 200,
            status: "success",
            message: "Profil berhasil diperbarui",
            data: updatedUser,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memperbarui profil" });
    }
});
exports.updateProfile = updateProfile;
