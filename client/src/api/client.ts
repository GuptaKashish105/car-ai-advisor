/**
 * Base path for all API calls. Defaults to the relative "/api", which the
 * Vite dev proxy forwards to the Express server (see vite.config.ts) — so
 * dev and same-origin production deploys both work with zero configuration.
 * VITE_API_BASE_URL is an escape hatch for deploying client and server
 * separately (e.g. different domains).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
    return body.error;
  }
  return `Request failed with status ${response.status}`;
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
    throw new ApiError(response.status, await extractErrorMessage(response));
  }

  return (await response.json()) as TResponse;
}
