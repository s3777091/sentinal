"use server";

import { PostDetail } from "@/types/types";
import { prisma } from "../db";
import { cache } from "react";

export const getPostDetail = cache(async (postId: string): Promise<PostDetail | null> => {
    return await prisma.post.findUnique({
      where: { id: parseInt(postId, 10) },
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
  });