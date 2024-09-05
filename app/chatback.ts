import { userRecordDb } from "@/types/types";
import { HfInference } from "@huggingface/inference";
import { Client } from "@gradio/client";
import { prisma } from "@/lib/db";

const MAX_USERS_PER_SERVER = 10;
const MAX_HISTORY_LENGTH = 50; // Increase this if needed

const hfToken: string = process.env.HUGGINGFACE_API_KEY || "";
const baseModel: string = process.env.BASE_ADMIN_MODEL || "";

// Validate Hugging Face token format
if (!hfToken.startsWith("hf_")) {
  throw new Error(
    "HUGGINGFACE_API_KEY is either not defined or not in the correct format (must start with 'hf_')."
  );
}

// Function to start a new conversation
export async function startNewConversation(
  userId: string
): Promise<{ id: number }> {
  try {
    await prisma.conversation.deleteMany({ where: { userId } });

    return prisma.conversation.create({
      data: { userId, messages: [] },
    });
  } catch (error) {
    console.error("Error in startNewConversation:", error);
    throw new Error("Failed to create a new conversation.");
  }
}

async function getOrAssignServer(userId: string): Promise<string | null> {
  try {
    // Fetch the user's record from the database
    const userRecord = await prisma.user.findUnique({
      where: { user_Id: userId },
    });

    if (!userRecord) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Extract the apiServerId from the user record
    const { apiServerId } = userRecord;

    // Check the number of users on the assigned server
    const userCount = apiServerId
      ? await prisma.user.count({ where: { apiServerId } })
      : MAX_USERS_PER_SERVER;

    // If the server has space, return the server's API URL
    if (userCount < MAX_USERS_PER_SERVER && apiServerId) {
      const server = await prisma.apiServer.findUnique({
        where: { id: apiServerId },
        select: { apiUrl: true },
      });

      return server?.apiUrl || (await findAndAssignSuitableServer(userId));
    }

    // If no valid server, find and assign a suitable one
    return await findAndAssignSuitableServer(userId);
  } catch (error) {
    console.error("Error in getOrAssignServer:", error);
    return null;
  }
}

// Helper function to find and assign a suitable server
async function findAndAssignSuitableServer(
  userId: string
): Promise<string | null> {
  const suitableServer = await prisma.apiServer.findFirst({
    where: { status: { in: ["low", "medium", "high"] } },
    orderBy: [{ status: "asc" }, { users: { _count: "asc" } }],
  });

  if (suitableServer) {
    await prisma.user.update({
      where: { user_Id: userId },
      data: { apiServerId: suitableServer.id },
    });
    return suitableServer.apiUrl;
  }

  return null;
}

// Function to handle vulnerable messages
export async function handleVulnerable(
  userID: string,
  inputMessage: string
): Promise<string> {
  try {
    const apiServerToUse = await getOrAssignServer(userID);

    if (!apiServerToUse) {
      return "User not Found";
    }

    const client = await Client.connect(`${baseModel}/${apiServerToUse}`, {
      hf_token: hfToken as `hf_${string}`,
    });

    const submission = client.submit("/predict", { prompt: inputMessage });
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
        console.log("Unexpected data format:", msg);
      }
    }

    return responseMessage;
  } catch (error) {
    console.error("Error in handleVulnerable:", error);
    return "API SERVER out of token";
  }
}

// Function to handle general information requests
export async function handleInformation(
  inputMessage: string,
  userId: string,
  newConversation = false
): Promise<string> {
  try {
    let conversationId: number;
    let messages: { role: string; content: string }[] = [];

    if (newConversation) {
      const newConversation = await startNewConversation(userId);
      conversationId = newConversation.id;
    } else {
      const existingConversation = await prisma.conversation.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (!existingConversation) {
        throw new Error("No existing conversation found.");
      }

      conversationId = existingConversation.id;
      messages = existingConversation.messages as {
        role: string;
        content: string;
      }[];
    }

    messages.push({ role: "user", content: inputMessage });

    // Limit history length
    if (messages.length > MAX_HISTORY_LENGTH) {
      messages = messages.slice(-MAX_HISTORY_LENGTH);
    }

    const hf = new HfInference(hfToken);
    let out = "";

    for await (const chunk of hf.chatCompletionStream({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages,
      max_tokens: 1024,
      temperature: 0.8,
      seed: 0,
    })) {
      if (chunk.choices && chunk.choices.length > 0) {
        out += chunk.choices[0].delta.content;
      }
    }

    messages.push({ role: "assistant", content: out });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { messages },
    });

    return out;
  } catch (error) {
    console.error("Error handling information:", error);
    throw new Error("Failed to process the request.");
  }
}
