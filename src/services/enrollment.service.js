import { pool } from "../database.js";
import { getUserByIdService } from "./user.service.js";
import { getSubjectByIdService } from "./subject.service.js";

export const enrollStudentService = async ({ alumno_id, materia_id }) => {
  // 1. Validar que el alumno existe y tiene el rol de alumno
  const student = await getUserByIdService(alumno_id);
  if (!student) {
    throw new Error(`Student with ID ${alumno_id} not found`);
  }
  if (student.rol !== "alumno") {
    throw new Error(`User with ID ${alumno_id} is not a student`);
  }

  // 2. Validar que la materia existe y no está eliminada (soft-deleted)
  const subject = await getSubjectByIdService(materia_id);
  if (!subject) {
    throw new Error(`Subject with ID ${materia_id} not found or is inactive`);
  }

  // 3. Verificar si el alumno ya está inscrito en esa materia
  const existingEnrollment = await pool.query(
    `
    SELECT 1 FROM alumno_materia
    WHERE alumno_id = $1 AND materia_id = $2
    `,
    [alumno_id, materia_id]
  );

  if (existingEnrollment.rows.length > 0) {
    throw new Error("Student is already enrolled in this subject");
  }

  // 4. Insertar la inscripción
  const result = await pool.query(
    `
    INSERT INTO alumno_materia (alumno_id, materia_id)
    VALUES ($1, $2)
    RETURNING alumno_id, materia_id, created_at
    `,
    [alumno_id, materia_id]
  );

  return result.rows[0];
};

export const unenrollStudentService = async ({ alumno_id, materia_id }) => {
  const result = await pool.query(
    `
    DELETE FROM alumno_materia
    WHERE alumno_id = $1 AND materia_id = $2
    RETURNING *
    `,
    [alumno_id, materia_id]
  );

  return result.rows.length > 0;
};

export const getSubjectStudentsService = async (materiaId) => {
  // Validar primero que la materia exista
  const subject = await getSubjectByIdService(materiaId);
  if (!subject) {
    throw new Error(`Subject with ID ${materiaId} not found`);
  }

  const result = await pool.query(
    `
    SELECT u.id, u.nombre, u.email, am.created_at as inscrito_en
    FROM alumno_materia am
    JOIN usuarios u ON am.alumno_id = u.id
    WHERE am.materia_id = $1
    ORDER BY u.nombre ASC
    `,
    [materiaId]
  );

  return result.rows;
};
