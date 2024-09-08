import * as z from "zod";

export const postSchema = z.object({
  authorId: z.string(),
  title: z.string().min(1, "Title is required").max(500, "Title is too long"),
  content: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")), // Allow empty string as a valid option
});

export const CommentValidation = z.object({
  comment: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
});

export const PostCommentValidation = z.object({
  content: z
    .string()
    .min(1, "Comment content cannot be empty")
    .max(3000, "Comment content cannot exceed 3000 characters"),
  postId: z.string(),
  authorId: z.string(),
});

export const postEdited = z.object({
  authorId: z.string(),
  postID: z.string(),
  title: z.string().min(1, "Title is required").max(500, "Title is too long"),
  content: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")), // Allow empty string as a valid option
});
