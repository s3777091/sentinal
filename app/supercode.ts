import { ScanArray, userDetail } from "@/types/types";
import { User } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import smile from "@/public/img/AI/smile.png";
import { redirect } from "next/navigation";


export async function getScanList(user: userDetail): Promise<ScanArray[]> {
  const prisma = new PrismaClient().$extends(withAccelerate());

  try {
    // Find the user by email or username
    const ex_User = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.email }, { username: user.username }],
      },
      cacheStrategy: { swr: 60, ttl: 60 },
    });

    if (!ex_User) {
      console.error('User not found.');
      return [];
    }

    // Fetch the list of ScanData associated with the user's ID
    const scans = await prisma.scanData.findMany({
      where: {
        userId: ex_User.id, // Use the user's ID
      },
      select: {
        id: true,
        title: true,
        detail: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return scans.length > 0 ? scans : [];
  } catch (error) {
    console.error('Error fetching scan data:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

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
        server: ex_User.apiServer || "cyberapi",
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

      ex_User = await prisma.user.create({
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
      email: email,
      username: ex_User.username,
      imageUrl: imageUrl || smile.src,
      server: ex_User.apiServer || "cyberapi",
    };
  } catch (error) {
    console.error("Error:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
