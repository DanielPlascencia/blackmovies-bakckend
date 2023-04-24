const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const usuariosSchema = new Schema({
  nombre: {
    type: String,
    trim: true,
    required: true,
  },
  nickname: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  peliculasFavoritas: [
    {
      type: Schema.Types.ObjectId,
      ref: "Peliculas",
    },
  ],
  rol: {
    type: String,
    default: "usuario",
  },
});

//* Método para hashear los passwords.
usuariosSchema.pre("save", async function (next) {
  //* Si el password ya esta hasheado...
  if (!this.isModified("password")) {
    return next();
  }

  //* Si no esta hasheado.
  const hash = await bcrypt.hash(this.password, 12);
  this.password = hash;

  next();
});

module.exports = mongoose.model("Usuarios", usuariosSchema);
