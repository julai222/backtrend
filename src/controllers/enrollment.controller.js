import {
  enrollStudentService,
  unenrollStudentService,
  getSubjectStudentsService,
} from "../services/enrollment.service.js";

export const enrollStudent = async (req, res) => {
  try {
    const { alumno_id, materia_id } = req.body;

    if (!alumno_id || !materia_id) {
      return res.status(400).json({
        message: "Missing required fields: alumno_id, materia_id",
      });
    }

    const enrollment = await enrollStudentService({ alumno_id, materia_id });

    return res.status(201).json({
      message: "Student enrolled in subject successfully",
      data: enrollment,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const unenrollStudent = async (req, res) => {
  try {
    const { alumno_id, materia_id } = req.body;

    if (!alumno_id || !materia_id) {
      return res.status(400).json({
        message: "Missing required fields: alumno_id, materia_id",
      });
    }

    const success = await unenrollStudentService({ alumno_id, materia_id });

    if (!success) {
      return res.status(404).json({
        message: "Enrollment not found",
      });
    }

    return res.status(200).json({
      message: "Student unenrolled from subject successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getSubjectStudents = async (req, res) => {
  try {
    const { id } = req.params; // ID de la materia
    const students = await getSubjectStudentsService(id);

    return res.status(200).json({
      message: "Subject students retrieved successfully",
      data: students,
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return res.status(statusCode).json({
      message: error.message,
    });
  }
};
