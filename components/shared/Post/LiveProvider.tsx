"use client";


import { getClerkUsers } from "@/lib/action/user.actions";
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
      resolveMentionSuggestions={async ({ text }) => {
        const response = await fetch(
          `/api/user/search?text=${encodeURIComponent(text)}`
        );

        if (!response.ok) {
          throw new Error("Problem resolving mention suggestions");
        }

        const userIds = await response.json();
        return userIds;
      }}
    >
      {children}
    </LiveblocksProvider>
  );
}