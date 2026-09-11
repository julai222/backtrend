import { checkDatabase } from "../services/health.service.js";

export const healthCheck = async (req, res) => {
  const dbStatus = await checkDatabase();

  res.status(dbStatus.ok ? 200 : 503).json({
    api: "UP",
    database: dbStatus.ok ? "UP" : "DOWN",
    ...(dbStatus.ok ? {} : { error: dbStatus.error }),
  });
};