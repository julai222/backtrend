import { Router } from "express";
import {
  enrollStudent,
  unenrollStudent,
  getSubjectStudents,
} from "../controllers/enrollment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Solo alumnos pueden inscribirse/desinscribirse
router.post("/", authenticate, authorize("alumno"), enrollStudent);
router.delete("/", authenticate, authorize("alumno"), unenrollStudent);

// Lectura: cualquier usuario autenticado
router.get("/subject/:id", authenticate, getSubjectStudents);

export default router;
