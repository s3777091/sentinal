import * as z from "zod";

export const UserDetailCheck = z.object({
  email: z.string().email(),
  username: z.string().min(1),
  userid: z.string(),
  imageUrl: z.string().url().optional(),
});