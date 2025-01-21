import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

interface Environment {
  NODE_ENV: string;
  PORT?: string;
}

export function setupEnvironment(): Environment {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    throw new Error(
      `Failed to load .env file from ${envPath}: ${result.error.message}`
    );
  }

  const env: Environment = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT,
  };

  return env;
}
