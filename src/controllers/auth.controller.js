import { pool } from "../database/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verificar si el usuario existe
    const { rows } = await pool.query("SELECT * FROM usuarios WHERE username = $1", [username]);
    const user = rows[0];
    
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    // Crear token
    const token = jwt.sign(
      { id: user.usuario_id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      usuario: { id: user.usuario_id, nombre: user.nombre, rol: user.rol },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
