import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  server: {
    port: process.env.PORT || 4000,
  },
  corsOptions: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  },
  clientURL: process.env.CLIENT_URL,
  port: process.env.PORT || 4000,
  meta: {
    location: "London, England, United Kingdom",
    timezone: "Europe/London",
    currentTime: new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London",
    }),
  },
};

export default config;
