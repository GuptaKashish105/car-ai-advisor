import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { recommendationsRouter } from "./routes/recommendations.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// CORS_ORIGIN restricts the API to specific deployed frontend origin(s) in
// production (comma-separated if there's more than one, e.g. a Vercel
// production domain plus preview deployments). Left unset, `cors()` falls
// back to its permissive default (any origin) — fine for local development,
// where there's nothing sensitive behind this API to protect.
const allowedOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors(allowedOrigins && allowedOrigins.length > 0 ? { origin: allowedOrigins } : undefined));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", recommendationsRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

function isJsonParseError(err: unknown): err is SyntaxError & { status: number; type: string } {
  return err instanceof SyntaxError && "type" in err && (err as { type?: string }).type === "entity.parse.failed";
}

// Centralized error handler. Express 5 forwards both thrown errors and
// rejected promises from route handlers here automatically, so this is the
// single place responsible for turning any failure — malformed JSON,
// unexpected bugs, anything — into a JSON response with the right status
// code, instead of Express's default HTML error page.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (isJsonParseError(err)) {
    res.status(400).json({ error: "Malformed JSON in request body" });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
