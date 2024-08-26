import { ChatBody } from "@/types/types";
import { Client } from "@gradio/client";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { CyberSend } from "@dad1909/cyber";

const psw: string | undefined = process.env.KAFKA_PASSWORD;
const hfToken: string | undefined = process.env.HUGGINGFACE_API_KEY;
const baseModel: string | undefined = process.env.BASE_ADMIN_MODEL;

if (!hfToken || !hfToken.startsWith("hf_")) {
  throw new Error(
    "HUGGINGFACE_API_KEY is either not defined or not in the correct format (must start with 'hf_')."
  );
}

if (!baseModel) {
  throw new Error("pls adding baseModel in .env or .env.local");
}

if (!psw) {
  throw new Error("pls adding kafka password in .env or .env.local");
}

const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST(req: Request): Promise<Response> {
  try {
    const { user, inputMessage, prompType } = (await req.json()) as ChatBody;

    const cyberSend = new CyberSend(psw!, "send_chat_message");

    const user_detail = await prisma.user.findFirst({
      where: { username: user },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    let apiServerToUse: string | null = null;

    if (user_detail) {
      if (user_detail.apiServerId) {
        const userCountOnServer = await prisma.user.count({
          where: { apiServerId: user_detail.apiServerId },
        });

        if (userCountOnServer > 5) {
          // Find the server based on status preference: low > medium > high
          const suitableServer = await prisma.apiServer.findFirst({
            where: { status: { in: ["low", "medium", "high"] } },
            orderBy: [
              { status: "asc" }, // Ascending order: low, medium, high
              { users: { _count: "asc" } }, // Within the same status, prefer fewer users
            ],
          });

          apiServerToUse = suitableServer?.apiUrl || null;

          // Update user's apiServerId to the new server's ID
          if (suitableServer) {
            await prisma.user.update({
              where: { id: user_detail.id },
              data: { apiServerId: suitableServer.id },
            });
          }
        } else {
          const serverDetails = await prisma.apiServer.findUnique({
            where: { id: user_detail.apiServerId },
            select: { apiUrl: true },
          });
          apiServerToUse = serverDetails?.apiUrl || null;
        }
      } else {
        // If user is not assigned to any server, assign to a suitable server based on status
        const suitableServer = await prisma.apiServer.findFirst({
          where: { status: { in: ["low", "medium", "high"] } },
          orderBy: [
            { status: "asc" }, // Ascending order: low, medium, high
            { users: { _count: "asc" } }, // Within the same status, prefer fewer users
          ],
        });

        apiServerToUse = suitableServer?.apiUrl || null;

        // Update user's apiServerId to the new server's ID
        if (suitableServer) {
          await prisma.user.update({
            where: { id: user_detail.id },
            data: { apiServerId: suitableServer.id },
          });
        }
      }
    }

    if (apiServerToUse) {

      const data = {
        user_id: user_detail?.id ?? 0,
        api_server: apiServerToUse,
      };

      await cyberSend.startProducer();
      await cyberSend.sendChat(data);

      const client = await Client.connect(
        baseModel!.concat("/").concat(apiServerToUse),
        {
          hf_token: hfToken as `hf_${string}`,
        }
      );

      const submission = client.submit("/predict", {
        selected_model: "CyberSentinel",
        prompt: inputMessage,
        prompt_type: prompType,
        max_length: 256,
      });

      let responseMessage = "";

      for await (const msg of submission) {
        if (msg.type === "data") {
          const resultData = msg.data;

          if (Array.isArray(resultData) && typeof resultData[0] === "string") {
            let msgArray = resultData as string[];
            let msg = msgArray[0];

            switch (prompType) {
              case "information":
                msg = msg.replace(
                  "Give me information about the following topic: ",
                  ""
                );
                break;
              case "vulnerable":
                msg = msg.replace(
                  "Identify the line of code that is vulnerable and describe the type of software vulnerability.",
                  ""
                );
                break;
              default:
                break;
            }

            responseMessage = msg.replace(inputMessage, "");
          } else {
            return new Response(
              JSON.stringify({ result: "Unexpected data format" }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        }
      }

      return new Response(JSON.stringify({ result: responseMessage }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ result: "user not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error connecting to the API:", error);
    return new Response("Error", { status: 500 });
  }
}
