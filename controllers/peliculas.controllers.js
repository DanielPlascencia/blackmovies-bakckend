//! IMPORTAR DEPENDENCIAS --
const shortid = require("shortid");
const multer = require("multer");
const { unlink } = require("node:fs/promises");

const Peliculas = require("../models/Peliculas.models");

//! --------- CONFIGURACIÓN MULTER ---------
const configuracionMulter = {
  storage: (fileStorage = multer.diskStorage({
    destination: (req, res, cb) => {
      cb(null, __dirname + "/../public/uploads");
    },
    filename: (req, file, cb) => {
      const extension = file.mimetype.split("/")[1];
      cb(null, `${shortid.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, cb) {
    if (
      file.mimetype === "image/jpeg" || //* JPG
      file.mimetype === "image/png" || //* PNG
      file.mimetype === "video/x-msvideo" || //* AVI
      file.mimetype === "video/quicktime" || //* MOV
      file.mimetype === "video/mp4" || //* MP4
      file.mimetype === "video/x-flv" //* FLV
    ) {
      cb(null, true);
    } else {
      cb(new Error("Formato No Válido. Sube un archivo JPG o PNG"));
    }
  },
};

const uploadArchivos = multer(configuracionMulter).fields([
  { name: "fotoPortada", maxCount: 1 },
  { name: "fotoFondo", maxCount: 1 },
  { name: "pelicula", maxCount: 1 },
]);

const subirArchivos = (req, res, next) => {
  uploadArchivos(req, res, function (error) {
    if (error) {
      return res.json({ msg: error });
    }

    next();
  });
};
//! ----------------------------------------

//! MOSTRAR PELÍCULAS --
const mostrarPeliculas = async (req, res, next) => {
  //* Asignación de página por default en 1.
  let pagina = 1;
  try {
    if (req.params.pagina) pagina = parseInt(req.params.pagina, 10);

    const peliculas = await Peliculas.paginate({}, { limit: 12, page: pagina });

    if (!peliculas) {
      res.status(404).json({ msg: "No se encontraron películas" });
    }
    res.json(peliculas);
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Hubo un error en la consulta: " + error.message });
  }
};

//! MOSTRAR PELÍCULA POR SU ID --
const mostrarPelicula = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pelicula = await Peliculas.findById(id).populate(
      "comentarios.usuario"
    );
    if (!pelicula) {
      res.status(404).json({ msg: "No se encontró ninguna pelicula" });
    }

    res.json(pelicula);
  } catch (error) {
    res
      .status(404)
      .json({ msg: "Ocurrió un error en la consulta: " + error.message });
  }
};

//! AGREGAR PELÍCULA --
const agregarPelicula = async (req, res, next) => {
  try {
    // console.log(req.files);
    if (!req.files.fotoPortada) {
      return res.status(406).json({ msg: "La portada es obligatorio" });
    }
    if (!req.files.fotoFondo) {
      return res.status(406).json({ msg: "La foto de fondo es obligatorio" });
    }
    if (!req.files.pelicula) {
      return res.status(406).json({ msg: "La película es obligatoria" });
    }

    req.body.fotoPortada = req.files.fotoPortada[0].filename;
    req.body.fotoFondo = req.files.fotoFondo[0].filename;
    req.body.pelicula = req.files.pelicula[0].filename;

    const peliculaAgregada = await Peliculas.create(req.body);
    peliculaAgregada.save();

    res.json({ msg: "Película agregada correctamente" });
    return;
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Ha ocurrido un error en la consulta: " + error.message });
  }
};

//! ACTUALIZAR PELÍCULA --
const actualizarPelicula = async (req, res) => {
  const { id } = req.params;
  const datosActualizados = req.body;

  try {
    const existePelicula = await Peliculas.findById(id);
    if (!existePelicula) {
      return res.status(404).json({ msg: "No existe una película" });
    }

    if (req.files.fotoPortada) {
      datosActualizados.fotoPortada = req.files.fotoPortada[0].filename;

      if (existePelicula?.fotoPortada) {
        //* Eliminar imagen vieja.
        await unlink(
          `${__dirname}/../public/uploads/${existePelicula?.fotoPortada}`
        );
      }
    }

    if (req.files.fotoFondo) {
      datosActualizados.fotoFondo = req.files.fotoFondo[0].filename;

      if (existePelicula?.fotoFondo) {
        //* Eliminar imagen vieja.
        await unlink(
          `${__dirname}/../public/uploads/${existePelicula?.fotoFondo}`
        );
      }
    }
    if (req.files.pelicula) {
      datosActualizados.pelicula = req.files.pelicula[0].filename;

      if (existePelicula?.pelicula) {
        //* Eliminar película vieja.
        await unlink(
          `${__dirname}/../public/uploads/${existePelicula?.pelicula}`
        );
      }
    }

    await Peliculas.findOneAndUpdate(
      { _id: existePelicula._id },
      datosActualizados,
      {
        new: true,
      }
    );

    res.json({ msg: "Película actualizada correctamente" });
  } catch (error) {
    res
      .status(400)
      .json({ msg: `Hubo un error en la consulta: ${error.message}` });
  }
};

//! ELIMINAR PELÍCULA --
const eliminarPelicula = async (req, res) => {
  const { id } = req.params;
  try {
    const obtenerPelicula = await Peliculas.findById(id);
    if (!obtenerPelicula) {
      return res.status(404).json({ msg: "No se pudo encontrar la pelicula." });
    }

    //* Eliminar imagenes guardadas.
    await unlink(
      `${__dirname}/../public/uploads/${obtenerPelicula.fotoPortada}`
    );
    await unlink(`${__dirname}/../public/uploads/${obtenerPelicula.fotoFondo}`);
    await unlink(`${__dirname}/../public/uploads/${obtenerPelicula.pelicula}`);

    await Peliculas.findByIdAndDelete(id);

    res.status(200).json({ msg: "Película eliminada correctamente" });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Hubo un error en la consulta: " + error.message });
  }
};

//! MOSTRAR PELÍCULAS POR GENERO --
const mostrarPorGenero = async (req, res) => {
  const { genero } = req.params;

  try {
    const obtenerPeliculas = await Peliculas.find({ generos: genero });
    if (!obtenerPeliculas || obtenerPeliculas.length === 0) {
      return res
        .status(404)
        .json({ msg: "No existe ninguna pelicula con ese genero" });
    }

    res.json(obtenerPeliculas);
  } catch (error) {
    res
      .status(400)
      .json({ msg: `Ocurrió un error en la consulta ${error.message}` });
  }
};

//! MOSTRAR PELÍCULAS POR VALORACIÓN --
const mostrarPorValoracion = async (req, res) => {
  const { valoracion } = req.params;

  try {
    const obtenerPeliculas = await Peliculas.find({ valoracion });
    if (!obtenerPeliculas || obtenerPeliculas.length === 0) {
      return res.status(404).json({ msg: "No se encontraron películas" });
    }

    res.json(obtenerPeliculas);
  } catch (error) {
    res
      .status(400)
      .json({ msg: `Ocurrió un error en la consulta: ${error.message}` });
  }
};

//! BUSCAR PELÍCULAS POR NOMBRE --
const buscarPeliculas = async (req, res) => {
  const { nombre } = req.body;

  try {
    const obtenerPeliculas = await Peliculas.find({
      nombrePelicula: { $regex: nombre, $options: "i" },
    }).select(
      "-fechaPelicula -generos -sinopsis -fotoFondo -pelicula -__v -comentarios"
    );

    if (!obtenerPeliculas || obtenerPeliculas.length === 0) {
      return res.status(404).json({ msg: "No se encontraron películas" });
    }

    res.json(obtenerPeliculas);
  } catch (error) {
    res
      .status(400)
      .json({ msg: `Ocurriò un error en la consulta: ${error.message}` });
  }
};

//! VALORAR PELICULA --
const valorarPelicula = async (req, res) => {
  const { id } = req.params;
  const { valoracion, usuario, texto } = req.body;

  try {
    const existePelicula = await Peliculas.findById(id);
    if (!existePelicula) {
      return res.status(404).json({ msg: "No existe la película" });
    }

    if (parseInt(valoracion) < 1 || parseInt(valoracion) > 5) {
      return res.status(400).json({ msg: "Puntaje incorrecto" });
    }

    const agregarComentario = {
      usuario,
      texto,
    };

    const comentarios = [...existePelicula.comentarios, agregarComentario];
    existePelicula.comentarios = comentarios;

    existePelicula.valoracion = Math.floor(
      (parseInt(valoracion) + existePelicula.valoracion) / 2
    );

    await existePelicula.save();

    res.json({ msg: "Valoración agregada correctamente" });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: `Ocurrió un error en la consulta: ${error.message}` });
  }
};

module.exports = {
  subirArchivos,
  mostrarPeliculas,
  mostrarPelicula,
  agregarPelicula,
  actualizarPelicula,
  eliminarPelicula,
  mostrarPorGenero,
  mostrarPorValoracion,
  buscarPeliculas,
  valorarPelicula,
};
