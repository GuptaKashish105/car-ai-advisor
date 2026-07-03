/**
 * Base path for all API calls. Defaults to the relative "/api", which the
 * Vite dev proxy forwards to the Express server (see vite.config.ts) — so
 * dev and same-origin production deploys both work with zero configuration.
 * VITE_API_BASE_URL is an escape hatch for deploying client and server
 * separately (e.g. different domains).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// A production build with no VITE_API_BASE_URL set falls back to the
// relative "/api" — correct for local dev (Vite's proxy) or a same-origin
// deployment, but almost certainly wrong for a static host like Vercel with
// no backend of its own to proxy to. This only ever logs; it doesn't change
// behavior, since a same-origin production setup is still legitimate.
if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    "[api/client] VITE_API_BASE_URL is not set. Falling back to the relative " +
      '"/api" — if this build is deployed separately from its backend (e.g. ' +
      "Vercel + Render), API requests will fail. Set VITE_API_BASE_URL to the " +
      "deployed backend's URL (including the /api prefix) at build time.",
  );
}

/**
 * Thrown whenever the server responded but with a non-2xx status — as
 * opposed to `fetch` itself rejecting (network failure, server unreachable),
 * which surfaces as a plain `TypeError`. Callers can use `instanceof ApiError`
 * to tell "the server rejected this request" (400 validation, 500, etc.)
 * apart from "the request never reached a server at all".
 */
export class ApiError extends Error {
  readonly status: number;
  /** Raw error payload from the server, e.g. Zod's `flatten()` output on a
   * 400. Untyped here since its shape is endpoint-specific; callers that
   * care about a particular endpoint's error shape can cast it themselves. */
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface ErrorResponseBody {
  message: string;
  details?: unknown;
}

async function extractErrorInfo(response: Response): Promise<ErrorResponseBody> {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
    const details = "details" in body ? body.details : undefined;
    return { message: body.error, details };
  }
  return { message: `Request failed with status ${response.status}` };
}

/**
 * Minimal typed JSON POST helper. Deliberately not a full HTTP client
 * (no interceptors, no retries, no GET/PUT/DELETE) — this app has exactly
 * one endpoint today, and adding more surface area than that is speculative.
 */
export async function postJson<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const { message, details } = await extractErrorInfo(response);
    throw new ApiError(response.status, message, details);
  }

  return (await response.json()) as TResponse;
}
