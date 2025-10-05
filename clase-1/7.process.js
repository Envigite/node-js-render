//Argumentos de entrada
console.log(process.argv);

//Controlar el proceso y su salida
process.exit(0);

//Controlar eventos del proceso
process.on("exit", () => {});

//Current working directory
console.log(process.cwd());

//Variavbles de entorno
console.log(process.env);
