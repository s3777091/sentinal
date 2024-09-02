import { userRecordDb } from "@/types/types";
import { PrismaClient } from "@prisma/client";
import { HfInference } from "@huggingface/inference";
import { Client } from "@gradio/client";
import Redis from "ioredis";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt("6379"),
  password: process.env.REDIS_PASSWORD,
});



const CACHE_EXPIRATION = 3600; // 1 hour cache expiration
const MAX_USERS_PER_SERVER = 10;
const MAX_HISTORY_LENGTH = 10; // Max number of messages in conversation history

const hfToken: string | undefined = process.env.HUGGINGFACE_API_KEY;
const baseModel: string | undefined = process.env.BASE_ADMIN_MODEL;

if (!baseModel) {
  throw new Error("pls adding baseModel in .env or .env.local");
}

if (!hfToken || !hfToken.startsWith("hf_")) {
  throw new Error(
    "HUGGINGFACE_API_KEY is either not defined or not in the correct format (must start with 'hf_')."
  );
}

// Function to start a new conversation
export async function startNewConversation(
  userId: number
): Promise<{ id: number }> {
  try {
    // Delete the existing conversation from Redis
    const conversationKey = `conversation:${userId}`;
    await redis.del(conversationKey); // Clear existing Redis data for this user

    // Create a new conversation in the database
    const newConversation = await prisma.conversation.create({
      data: {
        userId: userId,
        messages: [],
      },
    });

    // Store the conversation ID in Redis to track the current conversation
    await redis.set(`user:${userId}:currentConversation`, newConversation.id);

    // Optionally, reset any server assignments or other cached data
    await redis.del(`user:${userId}:server`);

    return newConversation; // Return the conversation object
  } catch (error) {
    console.error("Error in startNewConversation:", error);
    throw new Error("Failed to create a new conversation. Please try again.");
  }
}

// Function to handle vulnerable messages
export async function handleVulnerable(
  userRecord: userRecordDb,
  inputMessage: string
): Promise<string> {
  try {
    // Attempt to retrieve cached server URL from Redis
    let apiServerToUse = await redis.get(`user:${userRecord.id}:server`);

    if (!apiServerToUse) {
      apiServerToUse = await getOrAssignServer(userRecord);
      if (apiServerToUse) {
        await redis.set(
          `user:${userRecord.id}:server`,
          apiServerToUse,
          "EX",
          CACHE_EXPIRATION
        );
      }
    }

    if (apiServerToUse) {
      const client = await Client.connect(`${baseModel}/${apiServerToUse}`, {
        hf_token: hfToken as `hf_${string}`,
      });

      const submission = client.submit("/predict", {
        prompt: inputMessage, // Pass the conversation history
      });

      let responseMessage = "";
      for await (const msg of submission) {
        if (
          msg.type === "data" &&
          Array.isArray(msg.data) &&
          typeof msg.data[0] === "string"
        ) {
          responseMessage = msg.data[0].replace(
            "Identify the specific line of code that is vulnerable and describe the type of software vulnerability.",
            ""
          );
        } else {
          console.log("Unexpected data format:", msg); // Debugging output
        }
      }
      return responseMessage;
    } else {
      return "User not Found";
    }
  } catch (error) {
    console.error("Error in handleVulnerable:", error);
    return "API SERVER out of token";
  }
}

export async function handleInformation(
  inputMessage: string,
  userId: number,
  newConversation = false
): Promise<string> {
  try {
    let conversationId: number;
    let messages: { role: string; content: string }[] = [];

    // Start a new conversation by creating a new record in the database if required
    if (newConversation) {
      const newConversation = await prisma.conversation.create({
        data: {
          userId: userId,
          messages: [],
        },
      });
      conversationId = newConversation.id;
    } else {
      // Fetch the existing conversation for the user from the database
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc', // Get the most recent conversation
        },
      });

      if (existingConversation) {
        conversationId = existingConversation.id;
        messages = existingConversation.messages as { role: string; content: string }[];
      } else {
        throw new Error("No existing conversation found.");
      }
    }

    // Add the current user input to the conversation history
    messages.push({ role: "user", content: inputMessage });

    // Limit the conversation history to a maximum length if needed
    const MAX_HISTORY_LENGTH = 50; // example max length
    if (messages.length > MAX_HISTORY_LENGTH) {
      messages = messages.slice(-MAX_HISTORY_LENGTH);
    }

    // Set up Hugging Face Inference API for generating AI response
    const hf = new HfInference(hfToken);
    let out = "";

    // Generate the AI response using the chatCompletionStream method
    for await (const chunk of hf.chatCompletionStream({
      model: "mistralai/Mistral-7B-Instruct-v0.2", // Specify the model you are using
      messages: messages,
      max_tokens: 1024,
      temperature: 0.8,
      seed: 0,
    })) {
      if (chunk.choices && chunk.choices.length > 0) {
        out += chunk.choices[0].delta.content;
      }
    }

    // Add the assistant's response to the conversation history
    messages.push({ role: "assistant", content: out });

    // Update the conversation in the database with the new messages
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { messages: messages },
    });

    return out;
  } catch (error) {
    console.error("Error handling information:", error);
    throw new Error("Failed to process the request due to server issues.");
  }
}


// Helper function to get or assign a  vbc server
async function getOrAssignServer(
  userRecord: userRecordDb
): Promise<string | null> {
  const userCount = userRecord.apiServerId
    ? await prisma.user.count({
        where: { apiServerId: userRecord.apiServerId },
      })
    : MAX_USERS_PER_SERVER;

  if (userCount < MAX_USERS_PER_SERVER) {
    const server = await prisma.apiServer.findUnique({
      where: { id: userRecord.apiServerId || 1 }, // 1 is the default value
      select: { apiUrl: true },
    });
    return server?.apiUrl || (await findAndAssignSuitableServer(userRecord.id));
  } else {
    return await findAndAssignSuitableServer(userRecord.id);
  }
}

// Helper function to find and assign a suitable server
async function findAndAssignSuitableServer(
  userId: number
): Promise<string | null> {
  const suitableServer = await prisma.apiServer.findFirst({
    where: { status: { in: ["low", "medium", "high"] } },
    orderBy: [{ status: "asc" }, { users: { _count: "asc" } }],
  });

  if (suitableServer) {
    await prisma.user.update({
      where: { id: userId },
      data: { apiServerId: suitableServer.id },
    });
    return suitableServer.apiUrl;
  }

  return null;
}