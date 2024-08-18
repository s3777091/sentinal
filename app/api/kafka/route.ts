import { CyberCloud } from "@dad1909/cybersoda";
import { AIMessage, ChatBody, userDetail } from "@/types/types";
import { consumeMessages, produceMessage } from "@/app/supercode";

export async function GET(req: Request): Promise<Response> {
  try {
    const { username } = await req.json();

    if (!username) {
      return new Response("Missing required fields", { status: 400 });
    }

    const psw = process.env.KAFKA_PASSWORD;
    if (!psw) {
      throw new Error("PASSWORD Kafka must be set");
    }
    const cloudInstance = new CyberCloud(psw, "herrycole81_AI");
    consumeMessages(cloudInstance);

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
    const { message, username, selectedType } = await req.json();

    if (!message || !username || !selectedType) {
      return new Response("Missing required fields", { status: 400 });
    }

    if (message.length > 700) {
      return new Response(
        `Please enter code less than 700 characters. You are currently at ${message.length} characters.`,
        { status: 400 }
      );
    }

    const psw = process.env.KAFKA_PASSWORD;
    if (!psw) {
      throw new Error("PASSWORD Kafka must be set");
    }

    const cloudInstance = new CyberCloud(psw, username);
    const messageSend: AIMessage = {
      username: username,
      message: message,
      modelType: "Message",
      type: selectedType,
      lendata: 256,
    };

    await produceMessage(cloudInstance, messageSend);

    return new Response("Message sent successfully", { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Something went wrong when sending the message", {
      status: 500,
    });
  }
}
