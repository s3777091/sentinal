import { ScanArray, userDetail } from "@/types/types";
import { User } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import smile from "@/public/img/AI/smile.png";
import { redirect } from "next/navigation";

export async function getUser(user: User): Promise<userDetail | null> {
  const prisma = new PrismaClient().$extends(withAccelerate());

  try {
    const { emailAddresses, username: userUsername, imageUrl } = user;

    const email = emailAddresses[0].emailAddress;
    const username = userUsername || email.split("@")[0];

    // Modify the query to check for both email and username
    let ex_User = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    if (ex_User) {
      return {
        email: email,
        username: ex_User.username || "anonymous",
        imageUrl: imageUrl || smile.src,
      };
    } else {
      redirect("/sign-in");
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

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

    let ex_User = await prisma.user.findUnique({
      where: { email },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    if (!ex_User) {
      ex_User = await prisma.user.create({
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
    return {
      email: email,
      username: ex_User.username,
      imageUrl: imageUrl || smile.src,
    };
  } catch (error) {
    console.error("Error:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
