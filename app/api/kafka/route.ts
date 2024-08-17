import { CyberCloud } from "@dad1909/cybersoda";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

import { ChatBody, userDetail } from "@/types/types";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function POST(req: Request): Promise<Response> {
  try {
    const { inputMessage, prompType, length } = (await req.json()) as ChatBody;
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
