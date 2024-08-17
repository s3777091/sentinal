import { userDetail } from "@/types/types";
import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { redirect } from "next/navigation";
import smile from "@/public/img/AI/smile.png";
import { CyberAdmin } from "@dad1909/cybersoda";

export async function UserDetailUpdate(): Promise<userDetail | null> {
  try {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const prisma = new PrismaClient().$extends(withAccelerate());

    const email = user.emailAddresses[0].emailAddress;
    const username = user.username || email.split("@")[0];
    const fullName = `${user.firstName} ${user.lastName}`;
    const imageUrl = user.imageUrl;

    let existingUser = await prisma.user.findUnique({
      where: { email },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    if (!existingUser) {
      // Create the user if not exists
      existingUser = await prisma.user.create({
        data: {
          email,
          username,
          name: fullName,
          messageGroup: username.concat("_AI"),
          scanGroup: username.concat("_SCAN"),
          profile: {
            create: {
              image: imageUrl,
              bio: "",
            },
          },
        },
      });

      const psw = process.env.KAFKA_PASSWORD;
      if (!psw) {
        throw new Error("PASSWORD Kafka must be set");
      }
      const cyber = new CyberAdmin(psw);
      await cyber.createTopics([existingUser.messageGroup]);
    }

    // Prepare userDetails to return
    const userDetails: userDetail = {
      username: existingUser.username,
      imageUrl: imageUrl || smile.src,
    };

    return userDetails;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
