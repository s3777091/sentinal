import { ChatBody } from "@/types/types";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { handleInformation, handleVulnerable, startNewConversation } from "@/app/chatback";

export async function POST(req: Request): Promise<Response> {
  const prisma = new PrismaClient();

  try {
    const { user, inputMessage, prompType, newConversation } = (await req.json()) as ChatBody;

    // Find the user by username to get the user ID
    const userRecord = await prisma.user.findUnique({
      where: { username: user },
    });

    if (!userRecord) {
      return new Response(JSON.stringify({ result: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Optionally start a new conversation if requested
    if (newConversation) {
      await startNewConversation(userRecord.id);
    }

    let out: string;
    if (prompType === "information") {
      out = await handleInformation(inputMessage, userRecord.id, newConversation);
    } else {
      out = await handleVulnerable(userRecord, inputMessage);
    }

    return new Response(JSON.stringify({ result: out }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API error:", error);
    return new NextResponse(
      JSON.stringify({ data: "Our development team is reviewing your error..." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}