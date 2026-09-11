import express from "express";
import cors from "cors";
import morgan from "morgan";

import healthRoutes from "./router/health.route.js";
import authRoutes from "./router/auth.route.js";
import userRoutes from "./router/user.route.js";
import subjectRoutes from "./router/subject.route.js";
import enrollmentRoutes from "./router/enrollment.route.js";
import { generalLimiter } from "./middlewares/rateLimit.middleware.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));

// Rate limit global ANTES de parsear el body, así también cubre
// peticiones con JSON malformado y siempre responde con headers RateLimit
app.use(generalLimiter);
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/subjects", subjectRoutes);
app.use("/enrollments", enrollmentRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    status: "online",
    message: "API de Backtren funcionando perfectamente",
  });
});

app.use((err, req, res, next) => {
  // JSON malformado en el body (error del middleware express.json)
  if (err.type === "entity.parse.failed" || (err instanceof SyntaxError && err.status === 400)) {
    return res.status(400).json({
      message:
        "JSON inválido en el cuerpo de la petición. Revisá que el JSON esté bien formado y que no haya texto extra después de la llave de cierre.",
    });
  }

  return res.status(err.status || 500).json({
    message: "Error interno del servidor",
    error: err.message,
  });
});

export default app;