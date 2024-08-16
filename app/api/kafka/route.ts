import { CyberCloud } from "@dad1909/cybersoda";


export async function POST(req: Request): Promise<Response> {
  try {

    return new Response(JSON.stringify({ result: "" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error connecting to the API:", error);
    return new Response("Error", { status: 500 });
  }
}
