import { analyzePlayer } from "@/lib/riot/analyzePlayer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ region: string; gameName: string; tagLine: string }> },
) {
  try {
    const result = await analyzePlayer(await params);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze player.";
    const status = message.includes("not found") ? 404 : 500;

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "content-type": "application/json" },
    });
  }
}