"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";
import { NextResponse } from "next/server";

// User type definition
type User = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: { emailAddress: string }[];
  imageUrl: string;
};

// Function to fetch Clerk users by userIds
export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    // Fetch the paginated response from Clerk
    const response = await clerkClient.users.getUserList({
      userId: userIds,
    });

    // Access the actual array of users from the response (assuming it's in `response.data`)
    const users = response as unknown as User[];  // Adjust if necessary based on the actual API response structure

    // Map the user data into the desired format
    const userList = users.map((user: User) => ({
      id: user.id,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`, // Handle null values
      email: user.emailAddresses[0]?.emailAddress,
      avatar: user.imageUrl,
    }));

    // Sort the users according to the provided userIds
    const sortedUsers = userIds.map((id) =>
      userList.find((user) => user.id === id)
    );

    // Return the result after stringifying (if needed)
    return parseStringify(sortedUsers);
  } catch (error) {
    throw new NextResponse("FAIL TO FETCH USER");
  }
};