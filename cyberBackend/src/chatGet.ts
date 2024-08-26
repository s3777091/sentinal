import { CyberReceive } from "@dad1909/cyber";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

dotenv.config();

const psw = process.env.KAFKA_PASSWORD;
if (!psw) {
  throw new Error("PASSWORD must be set");
}

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
  const cyberReceive = new CyberReceive(psw!, "chat_group");

  const handleMessage = async (message: {
    user_id: number;
    server_id: number; // Change api_server to server_id
  }) => {
    console.log("Received message:");
    console.log(message.server_id); // Adjust to use server_id
  };

  await cyberReceive.getChat(handleMessage);
}

// Run the main
main().catch((error) => {
  console.error("Error in main function:", error);
});
