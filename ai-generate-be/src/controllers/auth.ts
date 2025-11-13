import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../prisma/client";
import { generateToken } from "../utils/generateToken";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";
import nodemailer from "nodemailer";

const registerSchema = Joi.object({
  name: Joi.string().min(4).max(20).required().messages({
    "string.empty": "Nama lengkap wajib diisi",
    "string.min": "Nama minimal 4 karakter",
    "string.max": "Nama maksimal 20 karakter",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email wajib diisi",
    "string.email": "Format email tidak valid",
  }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password wajib diisi",
    "string.min": "Password minimal 8 karakter",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Konfirmasi password tidak cocok",
    "any.required": "Konfirmasi password wajib diisi",
  }),
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: error.details.map((d) => d.message),
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.verificationToken.create({
      data: {
        token,
        userId: newUser.id,
        expiresAt,
      },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    await transporter.sendMail({
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    const foundToken = await prisma.verificationToken.findUnique({
      where: { token: String(token) },
      include: { user: true },
    });

    if (!foundToken) {
      return res.status(400).json({ message: "Token tidak valid" });
    }

    if (foundToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token sudah expired" });
    }

    await prisma.user.update({
      where: { id: foundToken.userId },
      data: { isVerified: true },
    });

    const updatedUser = await prisma.verificationToken.delete({ where: { id: foundToken.id } });
    console.log("User setelah verifikasi:", updatedUser);

    res.json({ message: "Email berhasil diverifikasi, silakan login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGIN
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({}),
  password: Joi.string().min(8).required().messages({}),
});

export const login = async (req: Request, res: Response) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email atau password salah" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Email atau password salah" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email belum diverifikasi, silakan periksa kotak masuk Anda." });
    }

    const token = generateToken({ id: user.id, email: user.email });

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGOUT

// export const login = async (req, res) => {
//   console.log("📥 Login controller dipanggil");

//   try {
//     console.log("📩 Body diterima:", req.body);
//     const { email, password } = req.body;

//     // pastikan request diterima
//     if (!email || !password) {
//       console.log("⚠️ Email atau password kosong");
//       return res.status(400).json({ message: "Email dan password wajib diisi" });
//     }

//     // tes query user
//     const user = await prisma.user.findUnique({ where: { email } });
//     console.log("👤 User ditemukan:", user);

//     if (!user) {
//       return res.status(404).json({ message: "User tidak ditemukan" });
//     }

//     // bandingkan password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     console.log("🔐 Password valid?", isPasswordValid);

//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Password salah" });
//     }

//     // generate token
//     const token = generateToken({ id: user.id, email: user.email });
//     console.log("🎟️ Token dibuat:", token);

//     res.cookie("token", token, { httpOnly: true });
//     return res.json({ message: "Login berhasil", user });
//   } catch (error) {
//     console.error("❌ ERROR di login:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token_user_tasteai", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.json({ message: "Logout berhasil" });
};

// PROFILE
export const profile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Gagal mengambil data profile",
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name } = req.body;
    const file = req.file;

    let avatarUrl: string | undefined;

    if (file) {
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream({ folder: "avatars", resource_type: "image" }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        streamifier.createReadStream(file.buffer).pipe(upload);
      });

      const result = await uploadPromise;
      avatarUrl = result.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        ...(avatarUrl && { avatarImage: avatarUrl }),
      },
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui profil" });
  }
};
