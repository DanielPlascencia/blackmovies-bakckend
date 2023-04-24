//! IMPORTAR DEPENDENCIAS --
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

//! IMPORTAR CONTROLLER --
const {
  obtenerUsuario,
  agregarUsuario,
  login,
  actualizarUsuario,
  eliminarUsuario,
  decodificarToken,
  agregarFavorito,
  eliminarFavorito,
  obtenerPeliculasFavoritas,
} = require("../controllers/usuarios.controllers");

//! OBTENER USUARIO --
router.post("/obtener-usuario", obtenerUsuario);

//! REGISTRAR UNA CUENTA --
router.post(
  "/agregar-usuario",
  [
    check("nombre")
      .isString()
      .withMessage("NOMBRE: Solo se aceptan letras")
      .isLength({ min: 3 })
      .withMessage("NOMBRE: Mínimo deben ser 3 letras"),
    check("nickname")
      .isAlphanumeric()
      .withMessage("NICKNAME: Escribe un Nickname válido"),
    check("email").isEmail().withMessage("EMAIL: Escribe un email válido"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("PASSWORD: Debe tener mínimo 6 caracteres"),
  ],
  agregarUsuario
);

//! INICIAR SESIÓN --
router.post("/iniciar-sesion", login);

//! ACTUALIZAR CUENTA --
router.put("/actualizar-usuario/:id", actualizarUsuario);

//! ELIMINAR CUENTA --
router.delete("/eliminar-usuario/:id", eliminarUsuario);

//! DECODIFICAR TOKEN DE USUARIO --
router.post("/decodificar-token", decodificarToken);

//! MARCAR PELICULA COMO FAVORITO --
router.post("/agregar-favorito", agregarFavorito);

//! ELIMINAR PELICULA FAVORITA --
router.post("/eliminar-favorito", eliminarFavorito);

//! OBTENER PELICULAS FAVORITAS --
router.get("/obtener-peliculas-favoritas/:id", obtenerPeliculasFavoritas);

module.exports = router;
