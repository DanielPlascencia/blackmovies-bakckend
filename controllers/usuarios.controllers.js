//! IMPORTAR DEPENDENCIAS --
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//! IMPORTAR MODELO --
const Usuarios = require("../models/Usuarios.models");
const Peliculas = require("../models/Peliculas.models");

//! OBTENER USUARIO POR SU ID --
const obtenerUsuario = async (req, res, next) => {
  const { id } = req.body;
  try {
    const existeUsuario = await Usuarios.findById(id);
    if (!existeUsuario) {
      return res.status(404).json({ msg: "El usuario no existe" });
    }

    res.json(existeUsuario);
  } catch (error) {
    return res
      .status(400)
      .json({ msg: `Ocurrió un error en la consulta: ${error.message}` });
  }
};

//! REGISTRAR UN USUARIO --
const agregarUsuario = async (req, res) => {
  const { nickname, email } = req.body;
  const errors = validationResult(req);

  try {
    //* Comprobar errores de express-validator.
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    //* Comprobar que los password sean iguales.
    if (req.body.password !== req.body.repassword) {
      return res.status(400).json({ msg: "Los passwords no son iguales" });
    }

    //* Comprobar si existe un email registrado en la DB.
    const existeEmail = await Usuarios.find({ email });

    if (existeEmail.length >= 1) {
      return res.status(400).json({ msg: "El email ya ha sido registrado" });
    }

    const existeNickname = await Usuarios.find({ nickname });
    if (existeNickname.length >= 1) {
      return res.status(400).json({ msg: "El nickname ya ha sido registrado" });
    }

    const crearUsuario = await Usuarios.create(req.body);
    await crearUsuario.save();

    res.json({ msg: "Usuario Creado Correctamente" });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: `Ocurrió un error en la consulta: ${error.message}` });
  }
};

//! INICIAR SESIÓN --
const login = async (req, res) => {
  try {
    const existeUsuario = await Usuarios.findOne({
      nickname: req.body.nickname,
    });

    if (!existeUsuario) {
      return res.status(404).json({ msg: "El nickname no existe" });
    }

    const comprobarPassword = bcrypt.compareSync(
      req.body.password,
      existeUsuario.password
    );

    if (!comprobarPassword) {
      return res.status(401).json({ msg: "Password incorrecto" });
    }

    const { _id, nombre, nickname, email, peliculasFavoritas } = existeUsuario;

    //* Generar el JWT.
    const token = jwt.sign(
      { id: _id.toString(), nombre, nickname, email, peliculasFavoritas },
      process.env.LLAVE,
      { expiresIn: "30d" }
    );

    res.json({ msg: "Autenticación exitosa", token });
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Ocurrió un error en la consulta: " + error.message });
  }
};

//! ACTUALIZAR USUARIO --
const actualizarUsuario = async (req, res) => {
  const errors = validationResult(req);

  const { id } = req.params;
  const datosActualizados = req.body;

  try {
    //* Comprobar errores de express-validator.
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    //* Comprobar si existe un usuario.
    const existeUsuario = await Usuarios.findById(id);

    if (!existeUsuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    //* Hashear el password actualizado, si existe.
    if (datosActualizados.password.length > 0) {
      //* Hashear el password.
      const hash = await bcrypt.hash(datosActualizados.password, 12);
      datosActualizados.password = hash;
    }

    if (datosActualizados.password.length == 0) {
      datosActualizados.password = existeUsuario.password;
    }

    await existeUsuario.updateOne(datosActualizados);

    res.json({ msg: "Datos actualizados correctamente" });
  } catch (error) {
    res
      .status(400)
      .json({ msg: `Ocurrió un error en la consulta: ${error.message}` });
  }
};

//! ELIMINAR CUENTA --
const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const existeUsuario = await Usuarios.findById(id);
    if (!existeUsuario) {
      return res.status(404).json({ msg: "No existe el usuario" });
    }

    //* Eliminar el usuario.
    await existeUsuario.deleteOne();

    res.json({ msg: "Usuario Eliminado Correctamente" });
  } catch (error) {
    res
      .status(400)
      .json({ msg: `Ocurrió un error en la consulta: ${error.message}` });
  }
};

//! DECODIFICAR EL TOKEN --
const decodificarToken = async (req, res) => {
  const { token } = req.body;
  try {
    const usuario = jwt.verify(token, process.env.LLAVE);
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ msg: `Ocurrió un error: ${error.message}` });
  }
};

//! MARCAR PELICULA COMO FAVORITO --
const agregarFavorito = async (req, res) => {
  const { idPelicula, idUsuario } = req.body;
  try {
    const existePelicula = await Peliculas.findById(idPelicula);
    if (!existePelicula) {
      return res.status(404).json({ msg: "Pelicula no existe" });
    }

    const existeUsuario = await Usuarios.findById(idUsuario);
    if (!existeUsuario) {
      return res.status(404).json({ msg: "Usuario no existe" });
    }

    existeUsuario.peliculasFavoritas = [
      ...existeUsuario.peliculasFavoritas,
      idPelicula,
    ];

    await existeUsuario.save();

    res.json({ msg: "Pelicula agragada correctamente" });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Ocurrió un erro en la consulta: " + error.message });
  }
};

//! ELIMINAR PELICULA FAVORITA --
const eliminarFavorito = async (req, res) => {
  const { idPelicula, idUsuario } = req.body;
  try {
    const existeUsuario = await Usuarios.findById(idUsuario);
    if (!existeUsuario) {
      return res.status(404).json({ msg: "Usuario no existe" });
    }

    const peliculaFavorita = existeUsuario.peliculasFavoritas.find(
      (pelicula) => pelicula == idPelicula
    );

    if (!peliculaFavorita) {
      return res.status(404).json({ msg: "No existe pelicula" });
    }

    existeUsuario.peliculasFavoritas = existeUsuario.peliculasFavoritas.filter(
      (pelicula) => pelicula != idPelicula
    );

    await existeUsuario.save();

    res.json({ msg: "Pelicula eliminada correctamente" });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Ocurrió un erro en la consulta: " + error.message });
  }
};

//! OBTENER PELICULAS FAVORITAS DEL USUARIO --
const obtenerPeliculasFavoritas = async (req, res) => {
  const { id } = req.params;

  try {
    const obtenerPeliculas = await Usuarios.findById(id)
      .select("-_id -nombre -email -nickname -password -rol -__v")
      .populate({ path: "peliculasFavoritas", select: "-__v" });
    if (!obtenerPeliculas) {
      return res.status(404).json({ msg: "No hay peliculas en favoritos" });
    }

    res.json(obtenerPeliculas);
  } catch (error) {
    return res
      .status(400)
      .json({ msg: `Ocurrió un error en la consulta: ${error.message}` });
  }
};

module.exports = {
  obtenerUsuario,
  agregarUsuario,
  login,
  actualizarUsuario,
  eliminarUsuario,
  decodificarToken,
  agregarFavorito,
  eliminarFavorito,
  obtenerPeliculasFavoritas,
};
