import { ChatBody } from "@/types/types";
import { Client } from "@gradio/client";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

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

export async function POST(req: Request): Promise<Response> {
  const prisma = new PrismaClient().$extends(withAccelerate());

  let user_detail: any = null;

  try {
    const { user, inputMessage, prompType } = (await req.json()) as ChatBody;
    user_detail = await prisma.user.findFirst({
      where: { username: user },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    if (!user_detail) {
      return new Response(JSON.stringify({ result: "user not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let apiServerToUse: string | null = null;

    if (user_detail.apiServerId) {
      const userCountOnServer = await prisma.user.count({
        where: { apiServerId: user_detail.apiServerId },
      });

      if (userCountOnServer >= 10) {
        const suitableServer = await prisma.apiServer.findFirst({
          where: { status: { in: ["low", "medium", "high"] } },
          orderBy: [
            { status: "asc" },
            { users: { _count: "asc" } },
          ],
        });

        apiServerToUse = suitableServer?.apiUrl || null;

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
      const suitableServer = await prisma.apiServer.findFirst({
        where: { status: { in: ["low", "medium", "high"] } },
        orderBy: [
          { status: "asc" },
          { users: { _count: "asc" } },
        ],
      });

      if (suitableServer) {
        apiServerToUse = suitableServer.apiUrl;
        await prisma.user.update({
          where: { id: user_detail.id },
          data: { apiServerId: suitableServer.id },
        });
      } else {
        return new Response(JSON.stringify({ result: "No suitable server found" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (apiServerToUse) {
      const client = await Client.connect(
        `${baseModel}/${apiServerToUse}`,
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
  } finally {
    if (user_detail && user_detail.apiServerId) {
      const updatedUserCount = await prisma.user.count({
        where: { apiServerId: user_detail.apiServerId },
      });

      let updatedStatus = "low";
      if (updatedUserCount === 3) {
        updatedStatus = "medium";
      } else if (updatedUserCount >= 5) {
        updatedStatus = "high";
      }

      await prisma.apiServer.update({
        where: { id: user_detail.apiServerId },
        data: { status: updatedStatus },
      });

      await prisma.user.update({
        where: { id: user_detail.id },
        data: { apiServerId: null },
      });
    }
  }
}