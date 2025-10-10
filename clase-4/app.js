import express from "express";
import { moviesRouter } from "./routes/movies.js";
import { corsMiddleware } from "./middlewares/cors.js";

const PORT = process.env.PORT ?? 3000;

const app = express();

app.use(express.json());
app.use(corsMiddleware());
app.disable("x-powered-by"); //Desabilitar el header x-powered-by por seguridad

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.use("/movies", moviesRouter);

app.use((req, res) => {
  res.status(404).send("<h1>404 Not Found</h1>");
});

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
