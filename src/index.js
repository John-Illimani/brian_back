import express from "express";
import { PORT } from "./config.js";

import otrosRoutes from "./routes/otros.routes.js";
import mantenimientoRoutes from "./routes/mantenimiento.routes.js";
import infraestructuraRoutes from "./routes/infraestructura.routes.js";
import grupoRoutes from "./routes/grupos.routes.js";
import encargadoRoutes from "./routes/encargado.routes.js";
import usersRoutes from "./routes/users.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import tipoRoutes from "./routes/tipo.routes.js";
import authRoutes from "./routes/auth.routes.js";
import calendarioRoutes from "./routes/calendario.routes.js";
import directorRoutes from "./routes/director.routes.js";
import paraleloRoutes from "./routes/paralelo.routes.js";
import materiaRoutes from "./routes/materias.routes.js";
import calificacionRoutes from "./routes/calificaciones.routes.js";
import boletinRoutes from "./routes/boletines.routes.js";
import teacherRoutes from "./routes/profesor.routes.js";
import estudiantesRoutes from "./routes/estudiantes.routes.js"

import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

import morgan from "morgan";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use(cors());

app.use(
  cors({
    origin: "https://daza.deno.dev",
    credentials: true,
  })
);

// aqui van mis rutas

app.use("/api", authRoutes);

app.use(otrosRoutes);
app.use(mantenimientoRoutes);
app.use(infraestructuraRoutes);
app.use(grupoRoutes);
app.use(encargadoRoutes);
app.use(tipoRoutes);
app.use(usersRoutes);
app.use(usuarioRoutes);
app.use(teacherRoutes);
app.use(calendarioRoutes);
app.use(directorRoutes);
app.use(paraleloRoutes);
app.use(materiaRoutes);
app.use(calificacionRoutes);
app.use(boletinRoutes);
app.use(estudiantesRoutes);

app.listen(PORT);

console.log("SERVER ON PORT ", PORT);
