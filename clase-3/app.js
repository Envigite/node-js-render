import express from "express";
import moviesJSON from "./movies.json" with { type: "json" };
import crypto from "node:crypto";
import validateMovie, { validatePartialMovie } from "./schemas/movies.js";

const PORT = process.env.PORT ?? 3000;

const app = express();

app.use(express.json());

app.disable("x-powered-by"); //Desabilitar el header x-powered-by por seguridad

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

const ACEPTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080"
]

app.get("/movies", (req, res) => {
    const origin = req.header("origin")
    if (ACEPTED_ORIGINS.includes(origin) || !origin) {
        res.header("Access-Control-Allow-Origin", origin)
    }

    const {genre} = req.query
    if (genre) {
        const filteredMovies = moviesJSON.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
    }

    res.json(moviesJSON)
})

app.get("/movies/:id", (req, res) => {
    const { id } = req.params
    const movie = moviesJSON.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).end("<h1>Movie not Found</h1>")
})

app.post("/movies", (req, res) => {
    const result = validateMovie(req.body)

    if (result.error) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    moviesJSON.push(newMovie)

    res.status(201).json(newMovie)// Actualizar la caché del cliente
})

app.patch("/movies/:id", (req, res) => {
    const result = validatePartialMovie(req.body)

    if(!result.success) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const { id } = req.params
    const movieIndex = moviesJSON.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({message: "Movie not found"})
    }

    const updateMovie = {
        ...moviesJSON[movieIndex],
        ...result.data
    }

    moviesJSON[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.use((req, res) => {
    res.status(404).send("<h1>404 Not Found</h1>")
})

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
