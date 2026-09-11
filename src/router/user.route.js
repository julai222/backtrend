import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getTeacherSubjects,
  getStudentSubjects,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Registro público (crear cuenta)
router.post("/", createUser);

// El resto requiere autenticación
router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUserById);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);

// Consultar relaciones ("Dictan" y "Cursan") asociadas al usuario
router.get("/teachers/:id/subjects", authenticate, getTeacherSubjects);
router.get("/students/:id/subjects", authenticate, getStudentSubjects);

export default router;