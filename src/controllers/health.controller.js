import { checkDatabase } from "../services/health.service.js";

export const healthCheck = async (req, res) => {
  const dbStatus = await checkDatabase();

  const dbUrlClean = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.replace(/:[^@]+@/, ':***@')
    : null;

  res.status(dbStatus.ok ? 200 : 503).json({
    api: "UP",
    database: dbStatus.ok ? "UP" : "DOWN",
    ...(dbStatus.ok ? {} : { 
      error: dbStatus.error,
      debug_env: {
        using_DATABASE_URL: dbUrlClean,
        using_DB_USER: process.env.DB_USER || null,
        using_DB_HOST: process.env.DB_HOST || null,
      }
    }),
  });
};