import * as z from "zod";

const bannedWords = ["spam", "advertisement", "wtf"];

export const postSchema = z.object({
  authorId: z.number().int().positive(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long")
    .refine(
      (value) => !bannedWords.some((word) => value.toLowerCase().includes(word)),
      {
        message: "Title contains banned words",
      }
    ),
  content: z.string().optional(),
  imageUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("")), // Allow empty string as a valid option
});


export const CommentValidation = z.object({
  comment: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
});

export const PostCommentValidation = z.object({
  content: z
    .string()
    .min(1, "Comment content cannot be empty")
    .max(500, "Comment content cannot exceed 500 characters")
    .refine(
      (value) => !bannedWords.some((word) => value.toLowerCase().includes(word)),
      {
        message: "Message contains banned words",
      }
    ),
  postId: z
    .string(),
  authorId: z
    .string()
});