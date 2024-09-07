import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || "";

  try {
    // Query the User model in Prisma, filter based on the `text` search param
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: text,  // Filter users by name containing the search text
          mode: "insensitive",  // Case-insensitive search
        },
      },
      select: {
        id: true,
        user_Id: true,
        name: true,
      },
    });

    // Map the users to the response format (e.g., user IDs)
    const filteredUserIds = users.map((user) => user.user_Id);

    // Return the filtered user IDs as JSON response
    return NextResponse.json(filteredUserIds);
  } catch (error) {
    // Handle any errors
    return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 });
  }
}