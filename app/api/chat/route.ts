import { NextResponse } from "next/server";
import {
  handleInformation,
  handleVulnerable,
  startNewConversation,
} from "@/app/chatback";
import { chatBodySchema } from "@/lib/validations/Chat";


export async function POST(req: Request): Promise<NextResponse> {
  try {
    const parsedData = chatBodySchema.parse(await req.json());

    const { userID, inputMessage, prompType, newConversation } = parsedData;

    // Optionally start a new conversation if requested
    if (newConversation) {
      await startNewConversation(userID);
    }

    let out: string;
    if (prompType === "information") {
      out = await handleInformation(inputMessage, userID, newConversation);
    } else {
      out = await handleVulnerable(userID, inputMessage);
    }

    return new NextResponse(JSON.stringify({ result: out }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        data: "Our development team is reviewing your error...",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
