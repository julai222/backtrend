import { pool } from "../database.js";

export const checkDatabase = async () => {
  try {
    await pool.query("SELECT 1");
    return { ok: true };
  } catch (error) {
    console.error("Error conectando a la base de datos:", error.message || error);
    return { ok: false, error: error.message || String(error) };
  }
};