import { CommentBodyInlineElement } from "@liveblocks/node";
import { WebhookHandler } from "@liveblocks/node";
import { liveblocks } from "@/lib/liveblocks";
import { prisma } from "@/lib/db";
import { HfInference } from "@huggingface/inference";

const webhookHandler = new WebhookHandler(process.env.WEBHOOKS_AI_DETECT_POST as string);

export async function POST(request: Request) {
  const body = await request.json();
  const headers = request.headers;


  // Verify if this is a real webhook request
  let event;
  try {
    event = webhookHandler.verifyRequest({
      headers: headers,
      rawBody: JSON.stringify(body),
    });
  } catch (err) {
    console.error(err);
    return new Response("Could not verify webhook call", { status: 400 });
  }

  const roomId = event.data.roomId ?? null;

  if (!roomId) {
    return new Response("roomId is null", { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case "roomCreated":
      await handleRoomCreated(roomId);
      break;
    case "roomDeleted":
      await handleRoomDeleted(roomId);
      break;
    default:
      return new Response("Event type not supported", { status: 400 });
  }

  return new Response("Event processed successfully", { status: 200 });
}

async function handleRoomCreated(roomId: string) {
  // Find the post related to this room
  const post = await prisma.post.findUnique({
    where: {
      room: roomId,
    },
  });

  if (!post) {
    throw new Error("Post does not exist");
  }

  let messages: { role: string; content: string }[] = [];

  // Add the post title and content to the conversation
  messages.push({
    role: "user",
    content: `Analyze the following post for potential security vulnerabilities, unsafe coding practices, or vulnerable code. Provide a yes or no answer indicating if the content contains any vulnerabilities, followed by an explanation if applicable. If vulnerabilities are present, also provide a solution or recommendation to fix the vulnerabilities.\n\nTitle: "${
      post.title
    }"\nContent: "${post.content || "No content provided."}"`,
  });

  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  let aiResponse = "";

  // Call the AI to analyze the post content and provide a solution if vulnerabilities exist
  for await (const chunk of hf.chatCompletionStream({
    model: "meta-llama/Meta-Llama-3-70B-Instruct",
    messages,
    max_tokens: 1024,
    temperature: 0.8,
    seed: 0,
  })) {
    if (chunk.choices && chunk.choices.length > 0) {
      aiResponse += chunk.choices[0].delta.content;
    }
  }

  // Check if the AI detected any vulnerabilities
  const isRelevant = aiResponse.toLowerCase().includes("yes");

  if (isRelevant) {
    const solutionMessage = `The following vulnerabilities were detected, along with the proposed solutions:\n\n${aiResponse}`;

    const messageAsChildren: CommentBodyInlineElement[] = [{ text: solutionMessage }];

    // Instead of passing the entire post in metadata, save a reference to the post (e.g., post ID)
    const postReference = post.id; // Use post ID as a reference

    // Create a new thread with the vulnerability and solution message
    await liveblocks.createThread({
      roomId,
      data: {
        comment: {
          userId: "s3777091@rmit.edu.vn",
          body: {
            version: 1,
            content: [
              {
                type: "paragraph",
                children: messageAsChildren,
              },
            ],
          },
        },
        metadata: {
          postId: postReference, // Save the post reference (ID) instead of the full content
        },
      },
    });

    return new Response(
      "Thread created in the room with the detected vulnerabilities and proposed solution.",
      { status: 200 }
    );
  } else {
    // If no vulnerabilities are detected, delete the post and room
    await prisma.post.delete({
      where: {
        id: post.id,
      },
    });
    await liveblocks.deleteRoom(roomId);
    return new Response("Post and room deleted as the content is not relevant to vulnerable code.", {
      status: 200,
    });
  }
}

async function handleRoomDeleted(roomId: string) {
  // Handle logic for when a room is deleted
  await prisma.post.deleteMany({
    where: {
      room: roomId,
    },
  });
  console.log(`Room ${roomId} and associated posts have been deleted.`);
}