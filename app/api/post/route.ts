import { postEdited, postSchema } from "@/lib/validations/Post";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { liveblocks } from "@/lib/liveblocks";

// PUT method to update a post
export async function PUT(req: Request): Promise<NextResponse> {
  try {
    const data = await req.json();
    const result = postEdited.safeParse(data);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ errors: result.error.format() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { authorId ,postID ,title, content, imageUrl } = result.data;
    const finalImageUrl = imageUrl || null;
    // Update the post in the database
    const updatedPost = await prisma.post.updateMany({
      where: {
        AND: [
          { id: parseInt(postID) }, // Post ID
          { authorId: authorId } // authorId ID
        ]
      },
      data: {
        title,
        content,
        imageUrl: finalImageUrl
      }
    });
    
    return new NextResponse(JSON.stringify(updatedPost), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return new NextResponse("Failed to update post", { status: 500 });
  }
}

// POST method to create a post
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const data = await req.json();
    const result = postSchema.safeParse(data);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ errors: result.error.format() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const roomId = nanoid();
    const { authorId, title, content, imageUrl } = result.data;
    const finalImageUrl = imageUrl || null;

    const post = await prisma.post.create({
      data: {
        title,
        room: roomId,
        content,
        imageUrl: finalImageUrl,
        author: {
          connect: { user_Id: authorId },
        },
      },
    });

    const metadata = {};

    await liveblocks.createRoom(roomId, {
      metadata,
      defaultAccesses: ["room:write"],
    });

    return new NextResponse(JSON.stringify(post), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to create post" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// GET method to retrieve posts
export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const pageNumber = Number(url.searchParams.get("pageNumber")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 20;
    const searchQuery = url.searchParams.get("q")?.toLowerCase() || "";

    const skipAmount = (pageNumber - 1) * pageSize;

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

// DELETE method to delete a post
export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const data = await req.json();
    const { postId } = data;

    // Validate the input
    if (!postId) {
      return new NextResponse(
        JSON.stringify({ error: "Missing postId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(postId),
      },
    });

    // Check if the post exists
    if (!post) {
      return new NextResponse(
        JSON.stringify({ error: "Post not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If post.room exists, delete the room
    if (post.room) {
      liveblocks.deleteRoom(post.room);
    }

    // Delete the post
    await prisma.post.delete({
      where: {
        id: parseInt(postId),
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "Post deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete post" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}