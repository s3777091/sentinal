import { userDetail } from "@/types/types";
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
    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    if (existingUser) {
      return {
        username: existingUser.username || "anonymous",
        imageUrl: imageUrl || smile.src,
        server: existingUser.apiServer || "cyberapi",
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

    let existingUser = await prisma.user.findUnique({
      where: { email },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    if (!existingUser) {
      // Start with the base "cyberapi" and increment as needed
      let apiServer = "cyberapi";
      let suffix = 0;

      while (true) {
        const count = await prisma.user.count({
          where: { apiServer },
        });

        // If fewer than 10 users are using this apiServer, use it
        if (count < 10) {
          break;
        }

        suffix += 1;
        apiServer = `cyberapi_${suffix}`;
      }

      existingUser = await prisma.user.create({
        data: {
          email,
          username,
          name: fullName,
          apiServer,
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
      username: existingUser.username,
      imageUrl: imageUrl || smile.src,
      server: existingUser.apiServer || "cyberapi",
    };
  } catch (error) {
    console.error("Error:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
