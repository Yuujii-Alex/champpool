import { z } from "zod";

export class RiotApiError extends Error {
  status: number;
  body: unknown;
  contentType: string;

  constructor(message: string, status: number, body: unknown, contentType = "application/json") {
    super(message);
    this.name = "RiotApiError";
    this.status = status;
    this.body = body;
    this.contentType = contentType;
  }
}

async function executeRiotRequest(url: string): Promise<Response> {
  const key = process.env.RIOT_API_KEY;

  if (!key) {
    throw new RiotApiError("Missing API key", 500, { error: "Missing API key" });
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const maxRetries = 3;
  const baseDelay = 500;

  let res: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      res = await fetch(url, {
        headers: {
          "X-Riot-Token": key,
        },
        cache: "no-store",
      });
    } catch {
      if (attempt === maxRetries) {
        throw new RiotApiError("Network error contacting Riot API", 502, {
          error: "Network error contacting Riot API",
        });
      }

      await sleep(baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300));
      continue;
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get("retry-after");
      let waitMs = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300);

      if (retryAfter) {
        const seconds = Number(retryAfter);

        if (!Number.isNaN(seconds)) {
          waitMs = seconds * 1000;
        } else {
          const retryDate = Date.parse(retryAfter);
          if (!Number.isNaN(retryDate)) {
            waitMs = Math.max(retryDate - Date.now(), 0);
          }
        }
      }

      if (attempt === maxRetries) {
        break;
      }

      await sleep(waitMs);
      continue;
    }

    if (res.status >= 500 && res.status < 600 && attempt < maxRetries) {
      await sleep(baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300));
      continue;
    }

    break;
  }

  if (!res) {
    throw new RiotApiError("No response from Riot API", 502, {
      error: "No response from Riot API",
    });
  }

  return res;
}

export async function fetchRiotData<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const res = await executeRiotRequest(url);
  const contentType = res.headers.get("content-type") ?? "application/json";

  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new RiotApiError("Unexpected non-JSON response from Riot API", 502, text, contentType);
  }

  const json: unknown = await res.json();

  if (!res.ok) {
    throw new RiotApiError("Riot API request failed", res.status, json, "application/json");
  }

  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    throw new RiotApiError("Invalid Riot response", 502, {
      error: "Invalid Riot response",
      issues: parsed.error.flatten(),
    });
  }

  return parsed.data;
}

export async function fetchRiotJson<T>(url: string, schema: z.ZodType<T>): Promise<Response> {
  try {
    const data = await fetchRiotData(url, schema);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    if (error instanceof RiotApiError) {
      const body = typeof error.body === "string" ? error.body : JSON.stringify(error.body);

      return new Response(body, {
        status: error.status,
        headers: { "content-type": error.contentType },
      });
    }

    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}