"use server";

import { liveblocks } from "../liveblocks";
import { parseStringify } from "../utils";


// Get the comment (room) by postID
export const getComment = async ({ postID }: { postID: string }) => {
  try {
    const room = await liveblocks.getRoom(postID);

    if (room) {
      return parseStringify(room); // Return the room if it exists
    }
    return null; // Return null if no room is found
  } catch (error) {
    console.log(`Error happened while getting a room: ${error}`);
    return null; // Return null in case of error
  }
};
