import { loginUserService } from "../services/auth.service.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Missing required fields: email, password",
      });
    }

    const data = await loginUserService({ email, password });

    return res.status(200).json({
      message: "Login exitoso",
      ...data,
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
};