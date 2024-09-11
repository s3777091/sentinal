import { CommentBodyInlineElement, CommentBodyText } from "@liveblocks/node";
import { WebhookHandler } from "@liveblocks/node";
import { liveblocks } from "@/lib/liveblocks";
import { prisma } from "@/lib/db";
import { HfInference } from "@huggingface/inference";
import { NextResponse } from "next/server";

const webhookHandler = new WebhookHandler(
  process.env.WEBHOOKS_AI_DETECT_POST as string
);

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
    return new NextResponse("Could not verify webhook call", { status: 400 });
  }

  const roomId = event.data.roomId ?? null;

  if (!roomId) {
    return new NextResponse("roomId is null", { status: 400 });
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
      return new NextResponse("Event type not supported", { status: 400 });
  }

  return new NextResponse("Event processed successfully", { status: 200 });
}

async function handleRoomCreated(roomId: string) {
  // Find the post related to this room
  const post = await prisma.post.findUnique({
    where: {
      room: roomId,
    },
  });

  if (!post) {
    throw new NextResponse("Post does not exist");
  }

  let messages: { role: string; content: string }[] = [];

  // Add the post title and content to the conversation
  messages.push({
    role: "user",
    content: `
    Analyze the following post for potential security vulnerabilities, 
    unsafe coding practices, or vulnerable code.
    Provide a yes or no answer indicating if the content contains any vulnerabilities, 
    followed by an explanation if applicable. If vulnerabilities are present, also provide a solution or 
    recommendation to fix the vulnerabilities will be one sentence long. Don't ramble. Just the important information. 
    No long explanations. Not even short explanations. No disclaimers.
    You can use these styles in your text: *bold*, _italic_, ~strikethrough~, and \`code\`.
    You can't combine styles like *_bold and italic_*.
    If you post \`code\`, remember to escape the "\`" character, because it will break the styling..\n\nTitle: "${
      post.title
    }"\nContent: "${post.content || "No content provided."}"`,
  });

  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  let aiResponse = "";

  try {
    for await (const chunk of hf.chatCompletionStream({
      model: "meta-llama/Meta-Llama-3-70B-Instruct",
      messages,
      max_tokens: 256,
      temperature: 0.8,
      seed: 0,
    })) {
      if (chunk.choices && chunk.choices.length > 0) {
        aiResponse += chunk.choices[0].delta.content;
      }
    }
  } catch (err) {
    console.error("Primary model failed, attempting fallback model...");

    // Fallback to secondary model in case of error
    try {
      for await (const chunk of hf.chatCompletionStream({
        model: "codellama/CodeLlama-34b-Instruct-hf",
        messages,
        max_tokens: 256,
        temperature: 0.8,
        seed: 0,
      })) {
        if (chunk.choices && chunk.choices.length > 0) {
          aiResponse += chunk.choices[0].delta.content;
        }
      }
    } catch (err) {
      return new NextResponse("Both primary and fallback models failed.", {
        status: 500,
      });
    }
  }

  const isRelevant = aiResponse.toLowerCase().includes("yes");

  if (!isRelevant) {
    let message = parseAiResponse(aiResponse as string);

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
                children: message,
              },
            ],
          },
        },
      },
    });
    return new NextResponse(
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
    return new NextResponse(
      "Post and room deleted as the content is not relevant to vulnerable code.",
      {
        status: 200,
      }
    );
  }
}

async function handleRoomDeleted(roomId: string) {
  // Handle logic for when a room is deleted
  await prisma.post.deleteMany({
    where: {
      room: roomId,
    },
  });
}

function parseAiResponse(input: string): CommentBodyInlineElement[] {
  const elements: CommentBodyInlineElement[] = [];
  const regex =
    /(\*.*?\*)|(_.*?_)|(~.*?~)|(`.*?(?:\\`.)*?`)|(https?:\/\/\S+[\w\/])/g;
  let lastIndex = 0;

  input.replace(
    regex,
    (match, bold, italic, strikethrough, code, link, index) => {
      if (index > lastIndex) {
        elements.push({ text: input.slice(lastIndex, index) });
      }

      if (link) {
        const adjustedLink = link.replace(/[.,!;?]+$/, "");
        elements.push({ type: "link", url: adjustedLink });
      } else {
        let text = match.slice(1, -1);
        if (code) {
          text = text.replace(/\\`/g, "`");
        }
        const textElement: CommentBodyText = { text };

        if (bold) {
          textElement.bold = true;
        }
        if (italic) {
          textElement.italic = true;
        }
        if (strikethrough) {
          textElement.strikethrough = true;
        }
        if (code) {
          textElement.code = true;
        }

        elements.push(textElement);
      }

      lastIndex = index + match.length;
      return match;
    }
  );

  if (lastIndex < input.length) {
    elements.push({ text: input.slice(lastIndex) });
  }

  return elements;
}