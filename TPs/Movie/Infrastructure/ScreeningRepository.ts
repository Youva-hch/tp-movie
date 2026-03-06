import { eq } from "drizzle-orm";
import { db } from "./drizzle.js";
import { screenings, rooms } from "./schema.js";
import type { Screening } from "../Domain/Screening.js";

export class ScreeningRepository {
  async listByMovieId(movieId: number): Promise<Screening[]> {
    const rows = await db
      .select({
        id: screenings.id,
        movieId: screenings.movieId,
        startTime: screenings.startTime,
        price: screenings.price,
        roomId: rooms.id,
        roomName: rooms.name,
        roomCapacity: rooms.capacity,
      })
      .from(screenings)
      .innerJoin(rooms, eq(screenings.roomId, rooms.id))
      .where(eq(screenings.movieId, movieId))
      .orderBy(screenings.startTime);

    return rows.map((row) => ({
      id: row.id,
      movieId: row.movieId,
      startTime: row.startTime,
      price: parseFloat(row.price),
      room: {
        id: row.roomId,
        name: row.roomName,
        capacity: row.roomCapacity,
      },
    }));
  }
}
