import { eq } from "drizzle-orm";
import { db } from "./drizzle.js";
import { movies } from "./schema.js";
import type { Movie } from "../Domain/Movie.js";

type MovieInput = {
  title: string;
  description?: string | null;
  durationMinutes: number;
  rating?: string | null;
  releaseDate?: string | null;
};

export class MovieRepository {
  async list(): Promise<Movie[]> {
    return db.select().from(movies).orderBy(movies.id);
  }

  async findById(id: number): Promise<Movie | null> {
    const result = await db.select().from(movies).where(eq(movies.id, id));
    return result[0] ?? null;
  }

  async create(data: MovieInput): Promise<Movie> {
    const result = await db.insert(movies).values(data).returning();
    const row = result[0];
    if (!row) throw new Error("Insert failed");
    return row;
  }

  async update(id: number, data: MovieInput): Promise<Movie | null> {
    const result = await db
      .update(movies)
      .set(data)
      .where(eq(movies.id, id))
      .returning();
    return result[0] ?? null;
  }

  async patch(id: number, data: Partial<MovieInput>): Promise<Movie | null> {
    const result = await db
      .update(movies)
      .set(data)
      .where(eq(movies.id, id))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(movies)
      .where(eq(movies.id, id))
      .returning({ id: movies.id });
    return result.length > 0;
  }
}
