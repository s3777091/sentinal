import { userDetail } from "@/types/types";
import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { redirect } from "next/navigation";
import smile from "@/public/img/AI/smile.png";

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
          profile: {
            create: {
              image: imageUrl,
              bio: "",
            },
          },
        },
      });
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
