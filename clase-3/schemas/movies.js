import z from "zod";

const moviesSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().min(1900).max(2025),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.url({
    message: "Poster must be a valid URL",
  }),
  genre: z.array(
    z.enum([
      "Action",
      "Adventure",
      "Drama",
      "Comedy",
      "Romance",
      "Thriller",
      "Sci-Fi",
      "Crime",
      "Animation",
      "Biography",
      "Fantasy",
    ]),
    {
      required_error: "Genre is required",
      invalid_type_error: "Genre must be an array of strings",
    }
  ),
  rate: z.number().min(0).max(10).default(0).optional(),
});

export default function validateMovie(object) {
  return moviesSchema.safeParse(object);
}

export function validatePartialMovie(object) {
  return moviesSchema.partial().safeParse(object);
}
