const mongoose = require("mongoose");
const db = mongoose
  .connect(`mongodb+srv://${process.env.DB}`)
  .then(() => console.log("DB conectado exitosamente."))
  .catch((error) => console.log("Hubo un error al conectar la DB: " + error));

module.exports = db;
