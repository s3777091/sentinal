"use server";

import { nanoid } from "nanoid";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { parseStringify } from "../utils";

declare type createCommentParams = {
  postID: string;
  title: string;
};

export const createComment = async ({ postID, title }: createCommentParams) => {
  try {
    // Check if a room already exists for the given postID
    const existingRoom = await getComment({ postID });

    if (existingRoom) {
      // Room already exists, return the existing room
      console.log(`Room already exists for postID: ${postID}`);
      return existingRoom;
    }

    // If no room exists, create a new one
    const roomId = nanoid(); // Generates a new room ID

    const metadata = {
      post: postID,
      title,
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      defaultAccesses: [],
    });

    // Revalidate the path to refresh the page
    revalidatePath("/");

    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while creating a room: ${error}`);
    throw error;
  }
};

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
