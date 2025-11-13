import { Request, Response } from "express";
import { generateAIService } from "../services/aiGenerate";
import { prisma } from "../prisma/client";
import cloudinary from "../utils/cloudinary";

export const generateAI = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { prompt, location } = req.body;
    const image = req.file;

    if (!prompt) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Prompt wajib diisi",
      });
    }

    let imageUrl: string | null = null;
    if (image) {
      await new Promise<void>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "ai_generate" }, (error, result) => {
          if (error) return reject(error);
          imageUrl = result?.secure_url || null;
          resolve();
        });
        stream.end(image.buffer);
      });
    }

    const result = await generateAIService(prompt, location, image);

    const formattedResult = result.data.map((item: any) => ({
      name: item.name,
      location: item.location,
      description: item.description,
      googleMapsUrl: item.googleMapsUrl,
      imageUrl: item.imageUrl || null,
      rating: item.rating ?? null,
    }));

    if (result.message) {
      return res.status(200).json({
        code: 200,
        status: "warning",
        message: result.message,
        data: [],
      });
    }

    await prisma.aiGeneration.create({
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
  } catch (err: any) {
    console.error("❌ generateAI error:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: err.message || "Gagal melakukan generate",
    });
  }
};

export const getAiHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Unauthorized: user tidak ditemukan",
      });
    }

    const history = await prisma.aiGeneration.findMany({
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
  } catch (err: any) {
    console.error("❌ getAiHistory error:", err);
    res.status(500).json({
      code: 500,
      status: "error",
      message: err.message || "Gagal mengambil riwayat generate",
    });
  }
};
