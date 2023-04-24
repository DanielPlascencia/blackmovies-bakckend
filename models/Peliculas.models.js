const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const peliculasSchema = new Schema({
  nombrePelicula: {
    type: String,
    trim: true,
    required: true,
  },
  fechaPelicula: {
    type: Date,
    required: true,
  },
  generos: [String],
  sinopsis: {
    type: String,
    trim: true,
    required: true,
  },
  fotoPortada: {
    type: String,
    trim: true,
    required: true,
  },
  fotoFondo: {
    type: String,
    trim: true,
  },
  pelicula: {
    type: String,
    trim: true,
  },
  valoracion: Number,
  comentarios: [
    {
      usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuarios",
      },
      texto: {
        type: String,
        trim: true,
      },
    },
  ],
});

//* Agregar la paginación en Mongoose.
peliculasSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Peliculas", peliculasSchema);
