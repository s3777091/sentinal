import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import smile from "@/public/img/AI/smile.png";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get all userIds from the query string
  const name = searchParams.getAll("userIds");

  // Check if userIds are provided and are in an array format
  if (!name || !Array.isArray(name) || name.length === 0) {
    return new NextResponse("Missing or invalid userIds", { status: 400 });
  }

  try {
    // Fetch users from the Prisma database where user_Id is in the provided userIds
    const users = await prisma.user.findMany({
      where: {
        username: {
          in: name,
        },
      },
      select: {
        user_Id: true,
        name: true,
        image: true, // Assuming you store the avatar image in the 'image' field
      },
    });

    // If no users are found, return a 404 response
    if (!users || users.length === 0) {
      return new NextResponse("No users found", { status: 404 });
    }

    // Format the response to include user details
    const formattedUsers = users.map((user) => ({
      userId: user.user_Id,
      name: user.name || "Unknown",
      avatar: user.image || smile.src, // Fallback avatar
    }));

    // Return the list of users in the response
    return NextResponse.json(formattedUsers);
  } catch (error) {
    // Handle any errors during database lookup
    return new NextResponse(`Error fetching users}`, {
      status: 500,
    });
  }
}
