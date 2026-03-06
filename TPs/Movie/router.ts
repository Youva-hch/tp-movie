import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import type { MovieRepository } from "./Infrastructure/MovieRepository.js";
import type { ScreeningRepository } from "./Infrastructure/ScreeningRepository.js";
import { isEveningScreening } from "./Domain/ScreeningService.js";

type RouterDeps = {
  movies: MovieRepository;
  screenings: ScreeningRepository;
};

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendError(res: ServerResponse, status: number, message: string): void {
  sendJson(res, status, { ok: false, error: message });
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf-8");
        resolve(raw.length > 0 ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const MovieIdSchema = z.coerce.number().int().positive();

const CreateMovieSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  durationMinutes: z.number().int().positive(),
  rating: z.string().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
});

const PatchMovieSchema = CreateMovieSchema.partial();

export async function router(
  req: IncomingMessage,
  res: ServerResponse,
  deps: RouterDeps
): Promise<void> {
  const { movies, screenings } = deps;
  const method = req.method ?? "GET";
  const [rawPath] = (req.url ?? "/").split("?", 2);
  const path = rawPath ?? "/";
  const segments = path.split("/").filter(Boolean);

  try {
    // GET /health
    if (method === "GET" && path === "/health") {
      return sendJson(res, 200, { ok: true });
    }

    // GET /movies
    if (method === "GET" && path === "/movies") {
      const items = await movies.list();
      return sendJson(res, 200, { ok: true, items });
    }

    // POST /movies
    if (method === "POST" && path === "/movies") {
      let body: unknown;
      try {
        body = await readBody(req);
      } catch {
        return sendError(res, 400, "Invalid JSON body");
      }
      const parsed = CreateMovieSchema.safeParse(body);
      if (!parsed.success) return sendError(res, 400, parsed.error.message);
      const item = await movies.create(parsed.data);
      return sendJson(res, 201, { ok: true, item });
    }

    // GET /movies/:id
    if (method === "GET" && segments.length === 2 && segments[0] === "movies") {
      const parsed = MovieIdSchema.safeParse(segments[1]);
      if (!parsed.success) return sendError(res, 400, "Invalid movie id");
      const item = await movies.findById(parsed.data);
      if (!item) return sendError(res, 404, "Movie not found");
      return sendJson(res, 200, { ok: true, item });
    }

    // PUT /movies/:id
    if (method === "PUT" && segments.length === 2 && segments[0] === "movies") {
      const parsedId = MovieIdSchema.safeParse(segments[1]);
      if (!parsedId.success) return sendError(res, 400, "Invalid movie id");
      let body: unknown;
      try {
        body = await readBody(req);
      } catch {
        return sendError(res, 400, "Invalid JSON body");
      }
      const parsed = CreateMovieSchema.safeParse(body);
      if (!parsed.success) return sendError(res, 400, parsed.error.message);
      const item = await movies.update(parsedId.data, parsed.data);
      if (!item) return sendError(res, 404, "Movie not found");
      return sendJson(res, 200, { ok: true, item });
    }

    // PATCH /movies/:id
    if (
      method === "PATCH" &&
      segments.length === 2 &&
      segments[0] === "movies"
    ) {
      const parsedId = MovieIdSchema.safeParse(segments[1]);
      if (!parsedId.success) return sendError(res, 400, "Invalid movie id");
      let body: unknown;
      try {
        body = await readBody(req);
      } catch {
        return sendError(res, 400, "Invalid JSON body");
      }
      const parsed = PatchMovieSchema.safeParse(body);
      if (!parsed.success) return sendError(res, 400, parsed.error.message);
      const item = await movies.patch(parsedId.data, parsed.data);
      if (!item) return sendError(res, 404, "Movie not found");
      return sendJson(res, 200, { ok: true, item });
    }

    // DELETE /movies/:id
    if (
      method === "DELETE" &&
      segments.length === 2 &&
      segments[0] === "movies"
    ) {
      const parsedId = MovieIdSchema.safeParse(segments[1]);
      if (!parsedId.success) return sendError(res, 400, "Invalid movie id");
      const deleted = await movies.delete(parsedId.data);
      if (!deleted) return sendError(res, 404, "Movie not found");
      return sendJson(res, 200, { ok: true });
    }

    // GET /movies/:id/screenings (ou /seances)
    if (
      method === "GET" &&
      segments.length === 3 &&
      segments[0] === "movies" &&
      (segments[2] === "screenings" || segments[2] === "seances")
    ) {
      const parsed = MovieIdSchema.safeParse(segments[1]);
      if (!parsed.success) return sendError(res, 400, "Invalid movie id");
      const items = await screenings.listByMovieId(parsed.data);
      const enrichedItems = items.map((item) => ({
        ...item,
        isEvening: isEveningScreening(item),
      }));
      return sendJson(res, 200, { ok: true, items: enrichedItems });
    }

    // Route inconnue
    return sendError(res, 404, "Route not found");
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Internal server error");
  }
}
