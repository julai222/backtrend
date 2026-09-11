import { Router } from "express";
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  assignTeacher,
} from "../controllers/subject.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Solo profesores pueden crear/modificar/eliminar materias
router.post("/", authenticate, authorize("profesor"), createSubject);
router.put("/:id", authenticate, authorize("profesor"), updateSubject);
router.delete("/:id", authenticate, authorize("profesor"), deleteSubject);

// Relación "Dictan" - Asignar profesor a materia (solo profesores)
router.put("/:id/teacher", authenticate, authorize("profesor"), assignTeacher);

// Lectura: cualquier usuario autenticado
router.get("/", authenticate, getSubjects);
router.get("/:id", authenticate, getSubjectById);

export default router;
