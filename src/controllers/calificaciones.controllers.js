import { pool } from "../database/database.js";

export const getCalificaciones = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM calificaciones");
  res.json(rows);
};

export const getCalificacionesMaterias = async (req, res) => {
  const { rows } = await pool.query(
    "SELECT c.calificacion_id,c.estudiante_id,c.total, m.nombre FROM calificaciones c ,materias m WHERE m.materia_id = c.materia_id"
  );
  res.json(rows);
};
export const getCalificacion1 = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM calificaciones WHERE calificacion_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Calificación no encontrada" });
  }
  res.json(rows[0]);
};

export const createCalificacion = async (req, res) => {
  const {
    primer_trimestre,
    segundo_trimestre,
    tercer_trimestre,
    total,
    materia_id,
    estudiante_id,
  } = req.body;

  if (
    primer_trimestre === undefined ||
    segundo_trimestre === undefined ||
    tercer_trimestre === undefined ||
    materia_id === undefined ||
    estudiante_id === undefined
  ) {
    return res.status(400).json({
      message:
        "primer_trimestre, segundo_trimestre, tercer_trimestre, materia_id y estudiante_id son requeridos",
    });
  }

  const { rows } = await pool.query(
    `INSERT INTO calificaciones
      (primer_trimestre, segundo_trimestre, tercer_trimestre, total, materia_id, estudiante_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      primer_trimestre,
      segundo_trimestre,
      tercer_trimestre,
      total,
      materia_id,
      estudiante_id,
    ]
  );

  return res.json(rows[0]);
};

export const updateCalificacion = async (req, res) => {
  const { id } = req.params;
  const {
    primer_trimestre,
    segundo_trimestre,
    tercer_trimestre,
    total,
    materia_id,
    estudiante_id,
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE calificaciones
     SET primer_trimestre = $1,
         segundo_trimestre = $2,
         tercer_trimestre = $3,
         total = $4,
         materia_id = $5,
         estudiante_id = $6
     WHERE calificacion_id = $7
     RETURNING *`,
    [
      primer_trimestre,
      segundo_trimestre,
      tercer_trimestre,
      total,
      materia_id,
      estudiante_id,
      id,
    ]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Calificación no encontrada" });
  }

  return res.json(rows[0]);
};

export const deleteCalificacion = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "DELETE FROM calificaciones WHERE calificacion_id = $1",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "Calificación no encontrada" });
  }

  return res.sendStatus(204);
};
