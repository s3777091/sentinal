import { postSchema } from "@/lib/validations/Post";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

import { nanoid } from "nanoid";
import { liveblocks } from "@/lib/liveblocks";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Parse the incoming request body to extract data
    const data = await req.json();

    // Validate the data using Zod
    const result = postSchema.safeParse(data);

    // If validation fails, return a 400 error
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ errors: "Your input is wrong" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If no room exists, create a new one
    const roomId = nanoid(); // Generates a new room ID
    // Destructure the validated data
    const { authorId, title, content, imageUrl } = result.data;

    // Check if imageUrl is actually an empty string
    const finalImageUrl = imageUrl || null;

    // Create a new Post in the database
    const post = await prisma.post.create({
      data: {
        title,
        room: roomId,
        content,
        imageUrl: finalImageUrl,
        author: {
          connect: { user_Id: authorId }, // Connect using user_Id, not id
        },
      },
    });
    //create room

    const metadata = {
      post: content || "",
      title,
    };

    // Create the room with public access (allow anyone to read/write)
    await liveblocks.createRoom(roomId, {
      metadata,
      defaultAccesses: ["room:write"], // Allow anyone to read and write
    });

    // Return a success response with the created post data
    return new NextResponse(JSON.stringify(post), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating post:", error);

    // Return an error response
    return new NextResponse("Failed to create post", {
      status: 500,
    });
  }
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const pageNumber = Number(url.searchParams.get("pageNumber")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 20;
    const searchQuery = url.searchParams.get("q")?.toLowerCase() || "";

    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetch the posts with pagination and optional search
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { content: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      skip: skipAmount,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            username: true,
            image: true,
          },
        },
      },
    });

    const totalPostsCount = await prisma.post.count({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { content: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
    });

    const isNext = totalPostsCount > skipAmount + posts.length;

    return new NextResponse(JSON.stringify({ posts, isNext }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to get list of posts" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
