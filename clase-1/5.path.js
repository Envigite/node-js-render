import path from "node:path";

//Barra separadora de carpeta según SO
console.log(path.sep);

//Unir rutas con path.join
const filePath = path.join("content", "subfolder", "test.txt");
console.log(filePath);

//Obtener el nombre de un archivo
const base = path.basename("/tmp/midu-secret-files/password.txt");
console.log(base);

//Obtener el nombre de un archivo sin la extensión
const filename = path.basename("/tmp/midu-secret-files/password.txt", ".txt");
console.log(filename);

//Obtener la extensión de un archivo
const extension = path.extname("image.jpg");
console.log(extension);
