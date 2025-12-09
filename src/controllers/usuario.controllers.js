import { pool } from "../database/database.js";
import bcrypt from "bcrypt";

const ROLES_PERMITIDOS = new Set([ "docente", "estudiante", "director"]);

// 💡 helper para no exponer contraseñas
const sanitizeUser = (row) => {
  if (!row) return row;
  const { password, ...safe } = row;
  return safe;
};

// ✅ Obtener todos los usuarios (sin password)
export const getUsuarios = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM usuarios ORDER BY usuario_id ASC");
    res.json(rows.map(sanitizeUser));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Crear un nuevo usuario (HASH)
export const createUsuario = async (req, res) => {
  try {
    const { username, password, rol, nombre, apellido } = req.body;

    if (!username || !password || !rol || !nombre || !apellido) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }
    if (!ROLES_PERMITIDOS.has(rol)) {
      return res.status(400).json({
        message: `Rol inválido. Use uno de: ${[...ROLES_PERMITIDOS].join(", ")}`,
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO usuarios (username, password, rol, nombre, apellido)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [username, hashed, rol, nombre, apellido]
    );

    res.status(201).json(sanitizeUser(rows[0]));
  } catch (error) {
    console.error("Error al crear usuario:", error);
    if (error.code === "23505") {
      // unique_violation (username duplicado)
      return res.status(400).json({ message: "El nombre de usuario ya existe" });
    }
    if (error.code === "23514") {
      // check_violation (rol inválido si hay CHECK en DB)
      return res.status(400).json({ message: "Rol inválido según la restricción de la tabla" });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Actualizar usuario (HASH opcional si envías password)
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, rol, nombre, apellido } = req.body;

    // Traer usuario actual para conservar password si no llega una nueva
    const current = await pool.query(
      "SELECT * FROM usuarios WHERE usuario_id = $1",
      [id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validar rol (si viene)
    if (rol && !ROLES_PERMITIDOS.has(rol)) {
      return res.status(400).json({
        message: `Rol inválido. Use uno de: ${[...ROLES_PERMITIDOS].join(", ")}`,
      });
    }

    const newUsername = username ?? current.rows[0].username;
    const newRol = rol ?? current.rows[0].rol;
    const newNombre = nombre ?? current.rows[0].nombre;
    const newApellido = apellido ?? current.rows[0].apellido;

    // Si envías password, hasheamos; si no, conservamos la actual
    let newPassword = current.rows[0].password;
    if (typeof password === "string" && password.length > 0) {
      newPassword = await bcrypt.hash(password, 10);
    }

    const { rows } = await pool.query(
      `UPDATE usuarios
       SET username = $1, password = $2, rol = $3, nombre = $4, apellido = $5
       WHERE usuario_id = $6
       RETURNING *`,
      [newUsername, newPassword, newRol, newNombre, newApellido, id]
    );

    res.json(sanitizeUser(rows[0]));
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "El nombre de usuario ya existe" });
    }
    if (error.code === "23514") {
      return res.status(400).json({ message: "Rol inválido según la restricción de la tabla" });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Eliminar usuario
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      "DELETE FROM usuarios WHERE usuario_id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Obtener usuario por ID (sin password)
export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE usuario_id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(sanitizeUser(rows[0]));
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
