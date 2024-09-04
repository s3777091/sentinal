import { PrismaClient } from "@prisma/client";
import { PostCommentValidation } from "@/lib/validations/Post";

const prisma = new PrismaClient();

export async function POST(req: Request): Promise<Response> {
  try {
    // Parse the incoming request body to extract data
    const data = await req.json();

    // Validate the data using Zod
    const validatedData = PostCommentValidation.parse(data);

    // Destructure the validated data
    const { postId, authorId, content } = validatedData;

    // Create a new comment using Prisma
    const comment = await prisma.comment.create({
      data: {
        content: content,
        post: { connect: { id: parseInt(postId, 10) } },
        author: { connect: { id: parseInt(authorId, 10) } },
      },
    });

    // Return a success response
    return new Response(JSON.stringify(comment), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);

    // Return an error response
    return new Response("Failed to create comment", {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
