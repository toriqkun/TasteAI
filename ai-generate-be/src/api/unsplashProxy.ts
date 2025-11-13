import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.query as string;
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) return res.status(500).json({ error: "Unsplash key not found" });

  try {
    const resp = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: { query, per_page: 1 },
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    const imageUrl = resp.data.results?.[0]?.urls?.regular;
    if (!imageUrl) throw new Error("Image not found");

    res.json({ imageUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
