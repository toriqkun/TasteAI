import axios from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { openai } from "../utils/openaiClient";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const CACHE_FILE = path.join(__dirname, "../../cache/ai_recommendations.json");

// TTL cache dalam milidetik (24 jam)
const CACHE_TTL = 24 * 60 * 60 * 1000;

if (!fs.existsSync(path.dirname(CACHE_FILE))) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

const readCache = (): Record<string, CacheEntry> => {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    return {};
  }
};

const writeCache = (data: Record<string, CacheEntry>) => {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
};

const generateCacheKey = (prompt: string, location?: string) => {
  return crypto
    .createHash("md5")
    .update(`${prompt}_${location || ""}`)
    .digest("hex");
};

const isCacheValid = (entry: CacheEntry) => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

export const generateAIService = async (prompt: string, location?: string, image?: Express.Multer.File) => {
  if (!prompt) throw new Error("Prompt wajib diisi");

  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  let imageBase64: string | null = null;

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

  const parseAIResponse = (content: string) => {
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
  } else if (!image && cacheData[cacheKey] && !isCacheValid(cacheData[cacheKey])) {
    console.log("🕒 Cache expired — hapus dan regenerasi");
    delete cacheData[cacheKey];
    writeCache(cacheData);
  }

  let data: any[] = [];

  try {
    const messages: any[] = [
      {
        role: "user",
        content: [{ type: "text", text: basePrompt }, ...(imageBase64 ? [{ type: "image_url" as const, image_url: { url: `data:${image?.mimetype};base64,${imageBase64}` } }] : [])],
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    const content = completion.choices[0].message?.content?.trim() || "";

    if (content.toLowerCase().includes("maaf") && content.toLowerCase().includes("kuliner")) {
      return { data: [], message: "Maaf, saya hanya bisa memberikan rekomendasi restoran atau kuliner." };
    }

    data = parseAIResponse(content);
  } catch (error) {
    console.warn("⚠️ OpenAI gagal/limit — fallback ke Gemini:", (error as any).message);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const inputParts: any[] = [{ text: basePrompt }];
      if (imageBase64) {
        inputParts.push({
          inlineData: {
            data: imageBase64,
            mimeType: image?.mimetype || "image/jpeg",
          },
        });
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts: inputParts }],
      });

      const content = result.response.text().trim();

      if (content.toLowerCase().includes("maaf") && content.toLowerCase().includes("kuliner")) {
        return { data: [], message: "Maaf, saya hanya bisa memberikan rekomendasi restoran atau kuliner." };
      }

      data = parseAIResponse(content);
    } catch (geminiErr: any) {
      console.error("💥 Gemini juga gagal:", geminiErr);
      throw new Error("Gagal memproses permintaan dari kedua AI (OpenAI & Gemini).");
    }
  }

  // Enrich dengan Google Maps
  const enrichedData = await Promise.all(
    data.map(async (item) => {
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
        const searchRes = await axios.get(searchUrl);
        const place = searchRes.data.results?.[0];

        if (!place) throw new Error("Restoran tidak ditemukan di Google Maps");

        const placeId = place.place_id;
        const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;

        return {
          name: place.name,
          location: place.formatted_address,
          description: item.description,
          googleMapsUrl,
          imageUrl: place.photos?.[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${mapsApiKey}` : undefined,
          rating: place.rating || undefined,
        };
      } catch (err: any) {
        console.warn("⚠️ Gagal ambil detail dari Google API:", err.message);
        return {
          name: item.name,
          location: item.location || location || "",
          description: item.description,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        };
      }
    })
  );

  if (!image) {
    cacheData[cacheKey] = {
      data: enrichedData,
      timestamp: Date.now(),
    };
    writeCache(cacheData);
    console.log("✅ Cache disimpan (TTL 24 jam)");
  }

  return { data: enrichedData };
};
