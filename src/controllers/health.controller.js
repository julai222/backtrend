import { checkDatabase } from "../services/health.service.js";

export const healthCheck = async (req, res) => {
  const dbConnected = await checkDatabase();

  res.status(dbConnected ? 200 : 503).json({
    api: "UP",
    database: dbConnected ? "UP" : "DOWN",
  });
};