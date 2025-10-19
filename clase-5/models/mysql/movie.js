import mysql from "mysql2/promise";
import process from "process";

const DEFAULT_CONFIG = {
  host: "localhost",
  user: "root",
  port: 3309,
  password: "",
  database: "moviesdb",
};

const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG;
const connection = await mysql.createConnection(connectionString);

export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
      const lowerCaseGenre = genre.toLowerCase();

      // obtener géneros desde la tabla genre
      const [genres] = await connection.query(
        "SELECT id, name FROM genre WHERE LOWER(name) = ?;",
        [lowerCaseGenre]
      );

      // no se encontró el género
      if (genres.length === 0) return [];

      // obtener el id del primer resultado
      const [{ id }] = genres;

      // obtener todas las películas que tengan ese género
      const [movies] = await connection.query(
        `
        SELECT 
          BIN_TO_UUID(m.id) AS id,
          m.title,
          m.year,
          m.director,
          m.duration,
          m.poster,
          m.rate,
          JSON_ARRAYAGG(g.name) AS genre
        FROM movie AS m
        JOIN movie_genres AS mg ON m.id = mg.movie_id
        JOIN genre AS g ON mg.genre_id = g.id
        WHERE mg.genre_id = ?
        GROUP BY m.id;
      `,
        [id]
      );

      return movies;
    }

    // si no se pasa genre → devolver todas las películas
    const [movies] = await connection.query(
      `
      SELECT 
        BIN_TO_UUID(m.id) AS id,
        m.title,
        m.year,
        m.director,
        m.duration,
        m.poster,
        m.rate,
        JSON_ARRAYAGG(g.name) AS genre
      FROM movie AS m
      LEFT JOIN movie_genres AS mg ON m.id = mg.movie_id
      LEFT JOIN genre AS g ON mg.genre_id = g.id
      GROUP BY m.id;
    `
    );

    return movies;
  }

  static async getById({ id }) {
    const [movies] = await connection.query(
      `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie WHERE id = UUID_TO_BIN(?);`,
      [id]
    );
    if (movies.length === 0) return null;
    return movies;
  }

  static async create({ input }) {
    const {
      genre: genreInput,
      title,
      year,
      director,
      duration,
      poster,
      rate,
    } = input;

    const [uuidResult] = await connection.query(`SELECT UUID() uuid;`);
    const [{ uuid }] = uuidResult;

    try {
      await connection.query(
        `INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
        [title, year, director, duration, poster, rate]
      );
    } catch (error) {
      throw new Error("Error al crear la pelicula");
      //enviar la traza a un servicio interno
    }

    const [movies] = await connection.query(
      `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie WHERE id = UUID_TO_BIN(?);`,
      [uuid]
    );

    return movies[0];
  }

  static async delete({ id }) {
    try {
      // Eliminamos la película usando su UUID convertido a binario
      const [result] = await connection.query(
        `DELETE FROM movie WHERE id = UUID_TO_BIN(?);`,
        [id]
      );

      // Si no se eliminó ninguna fila, el id no existía
      if (result.affectedRows === 0) {
        return { message: "Película no encontrada", success: false };
      }

      return { message: "Película eliminada correctamente", success: true };
    } catch (error) {
      console.error("Error al eliminar la película:", error);
      throw new Error("Error al eliminar la película");
    }
  }

  static async update({ id, input }) {
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate,
      genre: genreInput,
    } = input;

    try {
      // Actualizar los datos de la película
      await connection.query(
        `UPDATE movie 
       SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ?
       WHERE id = UUID_TO_BIN(?, 1);`,
        [title, year, director, duration, poster, rate, id]
      );

      // Si se envían géneros, actualizar las relaciones
      if (genreInput && genreInput.length > 0) {
        // Primero eliminar relaciones antiguas
        await connection.query(
          `DELETE FROM movie_genres WHERE movie_id = UUID_TO_BIN(?, 1);`,
          [id]
        );

        // Insertar las nuevas relaciones
        for (const genreName of genreInput) {
          // Obtener el id del género
          const [genreRows] = await connection.query(
            `SELECT id FROM genre WHERE LOWER(name) = ?;`,
            [genreName.toLowerCase()]
          );

          if (genreRows.length > 0) {
            const genreId = genreRows[0].id;

            await connection.query(
              `INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?, 1), ?);`,
              [id, genreId]
            );
          }
        }
      }

      // Devolver la película actualizada
      const [movies] = await connection.query(
        `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) as id
       FROM movie
       WHERE id = UUID_TO_BIN(?, 1);`,
        [id]
      );

      return movies[0];
    } catch (error) {
      console.error("🔥 Error al actualizar la película:", error);
      throw new Error("Error al actualizar la película");
    }
  }
}
