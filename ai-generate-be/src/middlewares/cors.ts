import cors from "cors";

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
};

export default cors(corsOptions);
