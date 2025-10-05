import fs, { stat } from "node:fs";

const stats = fs.statSync("./archivo.txt");

console.log(
  stats.isFile(), //Si es un fichero
  stats.isDirectory(), //Si es un directorio
  stats.isSymbolicLink(), //Si es un enlace simbolico
  stats.size //Tamaño en bytes
);
