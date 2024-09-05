import * as z from "zod";

export const chatBodySchema = z.object({
  userID: z.string().nonempty(),
  inputMessage: z.string().max(3200, "Message should be less than 3200 characters"),
  prompType: z.enum(["information", "vulnerable", "Library"]),
  newConversation: z.boolean(),
});
