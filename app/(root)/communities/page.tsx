// server/CommunityWrapper.tsx
import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import Community from "@/components/shared/community";
import { UserDetailUpdate } from "@/app/supercode";
import smile from "@/public/img/AI/smile.png";

import { redirect } from "next/navigation";

const CommunityWrapper = async () => {
  const user = await currentUser();
  let useDetail = null;

  if (!user) {
    redirect("/sign-in");
    return null;
  } else {
    [useDetail] = await Promise.all([UserDetailUpdate(user)]);
  }

  return (
    <Community
      user={
        useDetail || {
          username: "Guest",
          imageUrl: smile.src,
        }
      }
    />
  );
};

export default CommunityWrapper;
