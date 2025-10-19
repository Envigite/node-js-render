import { validateMovie, validatePartialMovie } from "../schemas/movies.js";

export class MovieController {
  constructor({ movieModel }) {
    this.movieModel = movieModel;
  }
  getAll = async (req, res) => {
    try {
      const { genre } = req.query;
      const movies = await this.movieModel.getAll({ genre });

      res.json(movies);
    } catch (error) {
      console.error("Error al obtener las películas:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  getById = async (req, res) => {
    const { id } = req.params;

    // Verifica que tenga formato UUID válido
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid UUID format" });
    }

    try {
      const movie = await this.movieModel.getById({ id });

      if (movie) {
        return res.json(movie);
      } else {
        res.status(404).send("<h1>Movie not Found</h1>");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  create = async (req, res) => {
    const result = validateMovie(req.body);

    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const newMovie = await this.movieModel.create({ input: result.data });

    res.status(201).json(newMovie); // Actualizar la caché del cliente
  };

  delete = async (req, res) => {
    const { id } = req.params;
    const result = await this.movieModel.delete({ id });

    if (!result) {
      return res.status(404).json({ message: "Movie not found" });
    }

    return res.json({ message: "Movie deleted" });
  };

  update = async (req, res) => {
    const result = validatePartialMovie(req.body);

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;
    const updatedMovie = await this.movieModel.update({
      id,
      input: result.data,
    });
    return res.status(200).json(updatedMovie);
  };
}
