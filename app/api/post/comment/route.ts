import { PostCommentValidation } from "@/lib/validations/Post";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
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

        author: { connect: { user_Id: authorId } },

      },

    });

    // Return a success response
    return new NextResponse(JSON.stringify(comment), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Return an error response
    return new NextResponse("Failed to create comment", {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
