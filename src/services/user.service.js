import { pool } from "../database.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const createUserService = async ({
  nombre,
  email,
  password,
  rol,
}) => {
  const existingUser = await pool.query(
    `
    SELECT id
    FROM usuarios
    WHERE email = $1
    `,
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(
    password,
    SALT_ROUNDS
  );

  const result = await pool.query(
    `
    INSERT INTO usuarios (
      nombre,
      email,
      password_hash,
      rol
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      nombre,
      email,
      rol,
      created_at,
      updated_at
    `,
    [nombre, email, passwordHash, rol]
  );

  return result.rows[0];
};

export const getUsersService = async () => {
  const result = await pool.query(
    `
    SELECT id, nombre, email, rol, created_at, updated_at
    FROM usuarios
    ORDER BY created_at DESC
    `
  );
  return result.rows;
};

export const getUserByIdService = async (id) => {
  const result = await pool.query(
    `
    SELECT id, nombre, email, rol, created_at, updated_at
    FROM usuarios
    WHERE id = $1
    `,
    [id]
  );
  return result.rows[0] || null;
};

export const updateUserService = async (id, { nombre, email, password, rol }) => {
  // Verificar si el usuario existe
  const userExists = await getUserByIdService(id);
  if (!userExists) {
    return null;
  }

  // Si se actualiza el email, verificar duplicados
  if (email && email !== userExists.email) {
    const existingUser = await pool.query(
      `
      SELECT id FROM usuarios WHERE email = $1
      `,
      [email]
    );
    if (existingUser.rows.length > 0) {
      throw new Error("Email already registered by another user");
    }
  }

  let passwordHash = undefined;
  if (password) {
    passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  // Construir la consulta dinámicamente para actualizar solo los campos provistos
  const fields = [];
  const values = [];
  let index = 1;

  if (nombre !== undefined) {
    fields.push(`nombre = $${index++}`);
    values.push(nombre);
  }
  if (email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(email);
  }
  if (passwordHash !== undefined) {
    fields.push(`password_hash = $${index++}`);
    values.push(passwordHash);
  }
  if (rol !== undefined) {
    fields.push(`rol = $${index++}`);
    values.push(rol);
  }

  if (fields.length === 0) {
    return userExists; // No hay nada que actualizar
  }

  values.push(id);
  const query = `
    UPDATE usuarios
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING id, nombre, email, rol, created_at, updated_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteUserService = async (id) => {
  const userExists = await getUserByIdService(id);
  if (!userExists) {
    return false;
  }

  // Eliminación física
  await pool.query(
    `
    DELETE FROM usuarios
    WHERE id = $1
    `,
    [id]
  );
  return true;
};

export const getTeacherSubjectsService = async (teacherId) => {
  const result = await pool.query(
    `
    SELECT id, nombre, created_at, updated_at
    FROM materias
    WHERE profesor_id = $1 AND deleted_at IS NULL
    ORDER BY nombre ASC
    `,
    [teacherId]
  );
  return result.rows;
};

export const getStudentSubjectsService = async (studentId) => {
  const result = await pool.query(
    `
    SELECT m.id, m.nombre, m.profesor_id, u.nombre as profesor_nombre, u.email as profesor_email, am.created_at as inscrito_en
    FROM alumno_materia am
    JOIN materias m ON am.materia_id = m.id
    JOIN usuarios u ON m.profesor_id = u.id
    WHERE am.alumno_id = $1 AND m.deleted_at IS NULL
    ORDER BY m.nombre ASC
    `,
    [studentId]
  );
  return result.rows;
};