import * as z from "zod";

const bannedWords = ["spam", "advertisement", "wtf", "vietnam"];

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