import { CyberCloud } from "@dad1909/cybersoda";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

import { AIMessage, ChatBody, userDetail } from "@/types/types";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const produceMessage = async (
  cloud: CyberCloud,
  data: any
 ): Promise<{
  error?: string;
  success?: boolean;
  message?: string;
  details?: any;
 }> => {
  const transaction = await cloud.producer.transaction();
  try {
    const produceResponse = await cloud.sendMessage(transaction, data);
    if (produceResponse.error) {
      await transaction.abort();
      return {
        error: `Failed to send message to topic`,
        details: produceResponse.details,
      };
    }
    await transaction.commit();
    return {
      success: true,
      message: `Message sent to topic`,
    };
  } catch (error) {
    await transaction.abort();
    return {
      error: `Failed to send message to topic`,
      details: error,
    };
  }
 };


 const consumeMessages = async (
  cloud: CyberCloud
 ): Promise<{
  error?: string;
  success?: boolean;
  message?: string;
  details?: any;
 }> => {
  try {
    await cloud.getMessage((message) => {
      console.log(message);
    });
    return { success: true, message: "Consumer started successfully" };
  } catch (error) {
    return { error: `Failed to consume message`, details: error };
  }
 };
 
 export async function POST(req: Request): Promise<Response> {
  try {
    const { inputMessage, prompType } = (await req.json()) as ChatBody;
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const prisma = new PrismaClient().$extends(withAccelerate());

    const email = user.emailAddresses[0].emailAddress;

    let existingUser = await prisma.user.findUnique({
      where: { email },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    const psw = process.env.KAFKA_PASSWORD;
    if (!psw) {
      throw new Error("PASSWORD Kafka must be set");
    }

    if (existingUser) {
      const cloud = new CyberCloud(psw, existingUser.messageGroup);

      try {
        const messageSend: AIMessage = {
          username: existingUser.username,
          message: inputMessage,
          modelType: "Message",
          type: prompType,
          lendata: 256,
        };
        const produceResponse = await produceMessage(cloud, messageSend);
        if (!produceResponse.error) {

        } else {
          console.error(produceResponse);
        }
      } catch (error) {
        console.error({
          error: "Invalid input. Please enter to send message.",
          details: error,
        });
      }
   
      
    } else {
    }
    return new Response(JSON.stringify({ result: "" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error connecting to the API:", error);
    return new Response("Error", { status: 500 });
  }
}
