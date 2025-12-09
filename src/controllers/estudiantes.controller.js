import { pool } from "../database/database.js";


// ✅ Obtener todos los usuarios (sin password)
export const getestudiantes = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM estudiantes ORDER BY estudiante_id ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Crear un nuevo estudiante (HASH)
export const createestudiante = async (req, res) => {
  try {
    const { usuario_id, paralelo_id } = req.body;

    if (!usuario_id || !paralelo_id) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    const { rows } = await pool.query(
      `INSERT INTO estudiantes (usuario_id, paralelo_id)
       VALUES ($1, $2)
       RETURNING *`,
      [usuario_id, paralelo_id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear estudiante:", error);
    if (error.code === "23505") {
      // unique_violation (username duplicado)
      return res
        .status(400)
        .json({ message: "El nombre de estudiante ya existe" });
    }
    if (error.code === "23514") {
      // check_violation (rol inválido si hay CHECK en DB)
      return res
        .status(400)
        .json({ message: "Rol inválido según la restricción de la tabla" });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Actualizar estudiante (HASH opcional si envías password)
export const updateestudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const {  paralelo_id,frase } = req.body;

    // Traer estudiante actual para conservar password si no llega una nueva
    const current = await pool.query(
      "SELECT * FROM estudiantes WHERE estudiante_id = $1",
      [id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "estudiante no encontrado" });
    }

    const newParalelo_id = paralelo_id ?? current.rows[0].paralelo_id;
    const newfrase = frase ?? current.rows[0].frase;

    const { rows } = await pool.query(
      `UPDATE estudiantes
       SET paralelo_id = $1, frase = $2
       WHERE estudiante_id = $3
       RETURNING *`,
      [ newParalelo_id,newfrase, id]
    );
    return res.json(rows);

  } catch (error) {
    console.error("Error al actualizar estudiante:", error);
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ message: "El nombre de estudiante ya existe" });
    }
    if (error.code === "23514") {
      return res
        .status(400)
        .json({ message: "Rol inválido según la restricción de la tabla" });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Eliminar estudiante
export const deleteestudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      "DELETE FROM estudiantes WHERE estudiante_id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "estudiante no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar estudiante:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Obtener estudiante por ID 
export const getestudianteById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM estudiantes WHERE estudiante_id = $1",
      [id]
    );
    res.json(rows[0]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "estudiante no encontrado" });
    }

  } catch (error) {
    console.error("Error al obtener estudiante:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
