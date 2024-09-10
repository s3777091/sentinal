import { prisma } from "@/lib/db";
import { IncomingHttpHeaders } from "http";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix";
import smile from "@/public/img/AI/smile.png";
const webhookSecret = process.env.WEBHOOK_SECRET || "";

async function handler(request: Request) {
  const payload = await request.json();
  const headersList = headers();
  const heads = {
    "svix-id": headersList.get("svix-id"),
    "svix-timestamp": headersList.get("svix-timestamp"),
    "svix-signature": headersList.get("svix-signature"),
  };
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;

  try {
    evt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders
    ) as Event;
  } catch (err) {
    return NextResponse.json({}, { status: 400 });
  }

  const eventType: EventType = evt.type;

  // Handling user creation or update events using upsert
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, image_url, external_accounts } = evt.data;

    // Extract relevant information from external_accounts[0] (assuming the first account is primary)
    const externalAccount = external_accounts[0];
    const email = externalAccount.email_address;
    const username = externalAccount.username || email.split("@")[0]; // Use username or fallback to email prefix
    const firstName = externalAccount.first_name || "";
    const lastName = externalAccount.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim(); // Combine first and last name

    try {
      await prisma.user.upsert({
        where: { user_Id: id.toString() },
        update: {
          email: email,
          username: username,
          name: fullName,
          image: image_url || externalAccount.image_url || smile.src,
        },
        create: {
          user_Id: id.toString(),
          email: email,
          username: username,
          name: fullName,
          image: image_url || externalAccount.image_url || smile.src,
        },
      });

      return NextResponse.json(
        { message: "User upserted successfully" },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to upsert user" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "Event not handled" }, { status: 200 });
}

type EventType = "user.created" | "user.updated" | "*";

type Event = {
  data: {
    [x: string]: any;
    id: number;
    email: string;
    username: string;
    name?: string;
    image?: string;
    apiServerId?: number;
  };
  object: "event";
  type: EventType;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
