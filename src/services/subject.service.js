import { pool } from "../database.js";
import { getUserByIdService } from "./user.service.js";

export const createSubjectService = async ({ nombre, profesor_id }) => {
  // Validar que el profesor existe y tiene el rol de profesor
  const teacher = await getUserByIdService(profesor_id);
  if (!teacher) {
    throw new Error(`Teacher with ID ${profesor_id} not found`);
  }
  if (teacher.rol !== "profesor") {
    throw new Error(`User with ID ${profesor_id} is not a teacher`);
  }

  const result = await pool.query(
    `
    INSERT INTO materias (nombre, profesor_id)
    VALUES ($1, $2)
    RETURNING id, nombre, profesor_id, created_at, updated_at
    `,
    [nombre, profesor_id]
  );

  return result.rows[0];
};

export const getSubjectsService = async () => {
  const result = await pool.query(
    `
    SELECT m.id, m.nombre, m.profesor_id, u.nombre as profesor_nombre, u.email as profesor_email, m.created_at, m.updated_at
    FROM materias m
    JOIN usuarios u ON m.profesor_id = u.id
    WHERE m.deleted_at IS NULL
    ORDER BY m.created_at DESC
    `
  );
  return result.rows;
};

export const getSubjectByIdService = async (id) => {
  const result = await pool.query(
    `
    SELECT m.id, m.nombre, m.profesor_id, u.nombre as profesor_nombre, u.email as profesor_email, m.created_at, m.updated_at
    FROM materias m
    JOIN usuarios u ON m.profesor_id = u.id
    WHERE m.id = $1 AND m.deleted_at IS NULL
    `,
    [id]
  );
  return result.rows[0] || null;
};

export const updateSubjectService = async (id, { nombre, profesor_id }) => {
  // Verificar si la materia existe y no está eliminada
  const subject = await getSubjectByIdService(id);
  if (!subject) {
    return null;
  }

  // Si se actualiza el profesor, validar
  if (profesor_id && profesor_id !== subject.profesor_id) {
    const teacher = await getUserByIdService(profesor_id);
    if (!teacher) {
      throw new Error(`Teacher with ID ${profesor_id} not found`);
    }
    if (teacher.rol !== "profesor") {
      throw new Error(`User with ID ${profesor_id} is not a teacher`);
    }
  }

  const fields = [];
  const values = [];
  let index = 1;

  if (nombre !== undefined) {
    fields.push(`nombre = $${index++}`);
    values.push(nombre);
  }
  if (profesor_id !== undefined) {
    fields.push(`profesor_id = $${index++}`);
    values.push(profesor_id);
  }

  if (fields.length === 0) {
    return subject;
  }

  values.push(id);
  const query = `
    UPDATE materias
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${index} AND deleted_at IS NULL
    RETURNING id, nombre, profesor_id, created_at, updated_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteSubjectService = async (id) => {
  const subject = await getSubjectByIdService(id);
  if (!subject) {
    return false;
  }

  // Soft-delete de la materia
  await pool.query(
    `
    UPDATE materias
    SET deleted_at = NOW()
    WHERE id = $1
    `,
    [id]
  );
  return true;
};

export const assignTeacherService = async (subjectId, profesorId) => {
  return await updateSubjectService(subjectId, { profesor_id: profesorId });
};
