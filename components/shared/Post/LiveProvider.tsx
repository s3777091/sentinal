"use client";


import { getClerkUsers } from "@/lib/action/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { LiveblocksProvider } from "@liveblocks/react";
import { PropsWithChildren } from "react";

export function LiveProvider({ children }: PropsWithChildren) {
  return (
    <LiveblocksProvider
      authEndpoint="/api/live-auth"
      resolveUsers={async ({ userIds }) => {
          const user = await getClerkUsers({ userIds });
          return user;
      }}
    >
      {children}
    </LiveblocksProvider>
  );
}