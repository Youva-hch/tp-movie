import { createServer } from "node:http";
import { MovieRepository } from "./Infrastructure/MovieRepository.js";
import { ScreeningRepository } from "./Infrastructure/ScreeningRepository.js";
import { router } from "./router.js";

const PORT = Number(process.env["PORT"] ?? 3001);

const movies = new MovieRepository();
const screenings = new ScreeningRepository();

const server = createServer(async (req, res) => {
  await router(req, res, { movies, screenings });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
