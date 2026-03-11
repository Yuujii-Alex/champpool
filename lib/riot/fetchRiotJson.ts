import { z } from "zod";

export async function fetchRiotJson<T>(
  url: string,
  schema: z.ZodType<T>,
): Promise<Response> {
  const key = process.env.RIOT_API_KEY;

  if (!key) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
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
      });
    } catch {
      if (attempt === maxRetries) {
        return new Response(
          JSON.stringify({ error: "Network error contacting Riot API" }),
          {
            status: 502,
            headers: { "content-type": "application/json" },
          },
        );
      }

      await sleep(baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300));
      continue;
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get("retry-after");
      let waitMs =
        baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300);

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
    return new Response(JSON.stringify({ error: "No response from Riot API" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  const contentType = res.headers.get("content-type") ?? "application/json";

  if (!contentType.includes("application/json")) {
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  }

  try {
    const json: unknown = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify(json), {
        status: res.status,
        headers: { "content-type": "application/json" },
      });
    }

    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid Riot response" }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed.data), {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Error parsing Riot response" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}