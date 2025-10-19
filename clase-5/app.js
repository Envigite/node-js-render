import express from "express";
import { createMovieRouter } from "./routes/movies.js";
import { corsMiddleware } from "./middlewares/cors.js";
import { notFound } from "./middlewares/notFound.js";
import "dotenv/config";

export const createApp = ({ movieModel }) => {
  const PORT = process.env.PORT ?? 3000;

  const app = express();

  app.use(express.json());
  app.use(corsMiddleware());
  app.disable("x-powered-by"); //Desabilitar el header x-powered-by por seguridad

  /* app.get("/", (req, res) => {
    res.json({ message: "Hello World" });
  }); */

  app.use("/movies", createMovieRouter({ movieModel }));

  app.use(notFound);

  app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
  });
};
