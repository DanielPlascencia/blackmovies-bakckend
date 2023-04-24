require("dotenv").config(); //* CONFIGURAR .ENV

//! IMPORTAR DEPENDENCIAS --
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

//! IMPORTAR DB --
const db = require("./config/db");

//! IMPORTAR RUTAS --
const rutaPeliculas = require("./routes/peliculas.routes");
const rutaUsuarios = require("./routes/usuarios.routes");

const app = express(); //* Crear servidor.

//* Configuraciones.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//* Habilitar CORS.
app.use(cors());

//* Habilitar carpetas estaticas.
app.use(express.static(path.join("./public/uploads")));

//* Habilitar rutas.
app.use("/api/peliculas", rutaPeliculas);
app.use("/api/usuarios", rutaUsuarios);

const PORT = process.env.PORT || process.env.BACKEND_PORT;

//* Iniciar Servidor.
app.listen(PORT, () => {
  console.log(`Servidor conectado en el puerto: ${PORT}`);
});
