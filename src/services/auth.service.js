import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../database.js";
import { config } from "../config.js";

export const loginUserService = async ({ email, password }) => {
  const result = await pool.query(
    `
    SELECT id, nombre, email, password_hash, rol
    FROM usuarios
    WHERE email = $1
    `,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    },
    config.jwtSecret,
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    },
  };
};