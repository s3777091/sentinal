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
  const cyberReceive = new CyberReceive(psw!, "scan_group");

  const handleMessage = async (message: {
    username: string;
    title: string;
    level: string;
    detail: string;
  }) => {
    console.log("Received message:");
    // Find the user by username
    const user = await prisma.user.findUnique({
      where: {
        username: message.username,
      },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    // If the user is found, update the ScanData table
    if (user) {
      await prisma.scanData.create({
        data: {
          title: message.title,
          detail: message.level,
          more_detail: message.detail,
          userId: user.id,
        },
      });
      console.log(`ScanData entry created for user ${message.username}`);
    } else {
      console.error(`User with username ${message.username} not found`);
    }
  };

  await cyberReceive.getMessage(handleMessage);
}

// Run the main
main().catch((error) => {
  console.error("Error in main function:", error);
});
