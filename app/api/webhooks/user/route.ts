import { prisma } from "@/lib/db";
import { IncomingHttpHeaders } from "http";
import { NextResponse } from "next/server";
import smile from "@/public/img/AI/smile.png";
const webhookSecret = process.env.WEBHOOK_SECRET || "";


import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

async function handler(request: Request) {
  

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const eventType = evt.type

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
      console.error("Error upserting user:", error);
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