import { CyberCloud } from "@dad1909/cybersoda";
import { AIMessage, ChatBody, userDetail } from "@/types/types";

export async function GET(req: Request): Promise<Response> {
  try {
    const { username } = await req.json();

    if (!username) {
      return new Response("Missing required fields", { status: 400 });
    }


    return new Response("Message recieve success", { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Something went wrong when sending the message", {
      status: 500,
    });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    // Check if the request has a body
    const bodyText = await req.text();
    if (!bodyText) {
      return new Response("Request body is empty", { status: 400 });
    }

    // Attempt to parse the JSON body
    let parsedBody: { message?: string };
    try {
      parsedBody = JSON.parse(bodyText);
    } catch (error) {
      return new Response("Invalid JSON format", { status: 400 });
    }

    const { message } = parsedBody;

    if (!message) {
      return new Response("Missing required fields", { status: 400 });
    }

    if (message.length > 700) {
      return new Response(
        `Please enter code less than 700 characters. You are currently at ${message.length} characters.`,
        { status: 400 }
      );
    }

    console.log(message);

    return new Response("Message sent successfully", { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Something went wrong when sending the message", {
      status: 500,
    });
  }
}