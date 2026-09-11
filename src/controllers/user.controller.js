import {
  createUserService,
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  getTeacherSubjectsService,
  getStudentSubjectsService,
} from "../services/user.service.js";

export const createUser = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        message: "Missing required fields: nombre, email, password, rol",
      });
    }

    if (rol !== "alumno" && rol !== "profesor") {
      return res.status(400).json({
        message: "Invalid rol. Must be 'alumno' or 'profesor'",
      });
    }

    const user = await createUserService({
      nombre,
      email,
      password,
      rol,
    });

    return res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await getUsersService();
    return res.status(200).json({
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({
        message: `User with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;

    if (rol && rol !== "alumno" && rol !== "profesor") {
      return res.status(400).json({
        message: "Invalid rol. Must be 'alumno' or 'profesor'",
      });
    }

    const updatedUser = await updateUserService(id, {
      nombre,
      email,
      password,
      rol,
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: `User with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteUserService(id);

    if (!deleted) {
      return res.status(404).json({
        message: `User with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    // Si falla por integridad referencial (e.g. 23503 en Postgres)
    if (error.code === "23503") {
      return res.status(400).json({
        message: "Cannot delete user. This user has associated subjects (as teacher) or subject enrollments (as student). Delete those associations first.",
      });
    }
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getTeacherSubjects = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({
        message: `Teacher with ID ${id} not found`,
      });
    }

    if (user.rol !== "profesor") {
      return res.status(400).json({
        message: `User with ID ${id} is not a teacher`,
      });
    }

    const subjects = await getTeacherSubjectsService(id);
    return res.status(200).json({
      message: "Teacher subjects retrieved successfully",
      data: subjects,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getStudentSubjects = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({
        message: `Student with ID ${id} not found`,
      });
    }

    if (user.rol !== "alumno") {
      return res.status(400).json({
        message: `User with ID ${id} is not a student`,
      });
    }

    const subjects = await getStudentSubjectsService(id);
    return res.status(200).json({
      message: "Student subjects retrieved successfully",
      data: subjects,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};