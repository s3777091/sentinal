import { postSchema } from "@/lib/validations/Post";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

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

    // Destructure the validated data
    const { authorId, title, content, imageUrl } = result.data;

    // Check if imageUrl is actually an empty string
    const finalImageUrl = imageUrl || null;

    // Create a new Post in the database
    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: finalImageUrl,
        author: {
          connect: { user_Id: authorId },  // Connect using user_Id, not id
        },
      },
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
    // Extract query parameters
    const url = new URL(req.url);
    const pageNumber = Number(url.searchParams.get("pageNumber")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 20;
    const searchQuery = url.searchParams.get("q")?.toLowerCase() || "";

    // Calculate the number of posts to skip based on the page number and page size
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
            id: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Count the total number of posts matching the search query
    const totalPostsCount = await prisma.post.count({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { content: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
    });

    // Determine if there are more pages of posts available
    const isNext = totalPostsCount > skipAmount + posts.length;

    // Return a success response with the fetched posts and pagination info
    return new NextResponse(JSON.stringify({ posts, isNext }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Return an error response
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
