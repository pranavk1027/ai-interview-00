import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // Ensure the correct .env file is loaded

export default defineConfig({
  dialect: "postgresql",
  schema: "./utils/schema.js",
  out: "./drizzle",

  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DRIZZLE_DB_URL, // Ensure this is set correctly in your .env.local
  },
});
