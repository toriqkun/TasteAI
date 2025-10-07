import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import prisma from "../prisma/client";
import { generateToken } from "../utils/generateToken";

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
      },
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

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({}),
  password: Joi.string().min(8).required().messages({}),
});

// LOGIN
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

    const avatarUrl = file ? `${req.protocol}://${req.get("host")}/uploads/${file.filename}` : undefined;

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
