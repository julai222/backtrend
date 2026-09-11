import {
  createSubjectService,
  getSubjectsService,
  getSubjectByIdService,
  updateSubjectService,
  deleteSubjectService,
  assignTeacherService,
} from "../services/subject.service.js";

export const createSubject = async (req, res) => {
  try {
    const { nombre, profesor_id } = req.body;

    if (!nombre || !profesor_id) {
      return res.status(400).json({
        message: "Missing required fields: nombre, profesor_id",
      });
    }

    const subject = await createSubjectService({ nombre, profesor_id });

    return res.status(201).json({
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await getSubjectsService();
    return res.status(200).json({
      message: "Subjects retrieved successfully",
      data: subjects,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await getSubjectByIdService(id);

    if (!subject) {
      return res.status(404).json({
        message: `Subject with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      message: "Subject retrieved successfully",
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, profesor_id } = req.body;

    const updatedSubject = await updateSubjectService(id, { nombre, profesor_id });

    if (!updatedSubject) {
      return res.status(404).json({
        message: `Subject with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      message: "Subject updated successfully",
      data: updatedSubject,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteSubjectService(id);

    if (!deleted) {
      return res.status(404).json({
        message: `Subject with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      message: "Subject deleted successfully (soft-deleted)",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const assignTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { profesor_id } = req.body;

    if (!profesor_id) {
      return res.status(400).json({
        message: "Missing required field: profesor_id",
      });
    }

    const updatedSubject = await assignTeacherService(id, profesor_id);

    if (!updatedSubject) {
      return res.status(404).json({
        message: `Subject with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      message: "Teacher assigned to subject successfully",
      data: updatedSubject,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
