import { userDetail } from "@/types/types";
import { currentUser, User } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import smile from "@/public/img/AI/smile.png";
import { CyberAdmin, CyberCloud } from "@dad1909/cybersoda";
import { Console } from "console";

export async function UserDetailUpdate(user: User): Promise<userDetail | null> {
  const prisma = new PrismaClient().$extends(withAccelerate());
  try {
    const {
      emailAddresses,
      username: userUsername,
      firstName,
      lastName,
      imageUrl,
    } = user;

    const email = emailAddresses[0].emailAddress;
    const username = userUsername || email.split("@")[0];
    const fullName = `${firstName} ${lastName}`;

    let existingUser = await prisma.user.findUnique({
      where: { email },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          email,
          username,
          name: fullName,
          messageGroup: `${username}_AI`,
          scanGroup: `${username}_SCAN`,
          profile: {
            create: {
              image: imageUrl,
              bio: "",
            },
          },
        },
      });

      const kafkaPassword = process.env.KAFKA_PASSWORD;
      if (!kafkaPassword) {
        throw new Error("PASSWORD Kafka must be set");
      }

      const cyber = new CyberAdmin(kafkaPassword);
      await cyber.createTopics([existingUser.messageGroup]);
      console.log("create success");
    }

    return {
      username: existingUser.username,
      imageUrl: imageUrl || smile.src,
    };
  } catch (error) {
    console.error("Error:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export async function consumeMessages(cloud: CyberCloud): Promise<{
  error?: string;
  success?: boolean;
  message?: string;
  details?: any;
}> {
  try {
    await cloud.getMessage((message: any) => {
      console.log("Message received:", message);
    });

    return {
      success: true,
      message: "Consumer started successfully",
    };
  } catch (error) {
    console.error("Error consuming message:", error);
    return {
      error: `Failed to consume message`,
      details: error,
    };
  }
}

export async function produceMessage(
  cloud: CyberCloud,
  data: any
): Promise<{
  error?: string;
  success?: boolean;
  message?: string;
  details?: any;
}> {
  cloud.startProducer();
  const transaction = await cloud.producer.transaction();
  try {
    // Attempt to send the message using the transaction
    const produceResponse = await cloud.sendMessage(transaction, data);

    // Check if the response indicates an error
    if (produceResponse.error) {
      await transaction.abort();
      return {
        error: "Failed to send message to topic",
        details: produceResponse.details,
      };
    }

    // Commit the transaction if the message was sent successfully
    await transaction.commit();
    return {
      success: true,
      message: "Message sent to topic successfully",
    };
  } catch (error) {
    // Abort the transaction in case of an error
    await transaction.abort();
    return {
      error: "Failed to send message to topic",
      details: error,
    };
  }
}

export async function postMessage(user: User): Promise<void> {}
