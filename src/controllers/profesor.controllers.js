import { json } from "sequelize";
import { pool } from "../database/database.js";

export const getProfesores = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM profesores");
  res.json(rows);
};

export const getProfesor = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM profesores WHERE prof_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Profesor no encontrado" });
  }

  res.json(rows[0]);
};

export const createProfesor = async (req, res) => {
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ message: "usuario_id es requerido" });
  }

  const { rows } = await pool.query(
    "INSERT INTO profesores (usuario_id) VALUES ($1) RETURNING *",
    [usuario_id]
  );

  return res.json(rows[0]);
};

export const updateProfesor = async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  const { rows } = await pool.query(
    "UPDATE profesores SET usuario_id = $1 WHERE prof_id = $2 RETURNING *",
    [usuario_id, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Profesor no encontrado" });
  }

  return res.json(rows[0]);
};

export const deleteProfesor = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "DELETE FROM profesores WHERE prof_id = $1",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "Profesor no encontrado" });
  }

  return res.sendStatus(204);
};

export const getCalificacionesGeneral = async (req, res) => {
  const { rows } = await pool.query("select * from vista_registro_estudiantes");
  res.json(rows);
};

export const getMateriasConProfesores = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM materiasConProfesor");
    res.json(rows).status(200);
  } catch (error) {
    return res.json(404).json({ message: "datos no encontrados" });
  }
};
