import cors from "cors";

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
};

export default (cors(corsOptions));