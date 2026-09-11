export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado.",
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        message: `Acceso denegado. Este usuario (rol: ${req.user.rol}) no puede realizar esta acción. Solo permitido para: ${roles.join(", ")}.`,
      });
    }

    next();
  };
};
