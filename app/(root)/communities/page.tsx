// server/CommunityWrapper.tsx
import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import Community from "@/components/shared/community";
import { UserDetailUpdate } from "@/app/supercode";
import smile from "@/public/img/AI/smile.png";

const CommunityWrapper = async () => {
const [useDetail] = await Promise.all([UserDetailUpdate()]);
  
  return <Community user={useDetail || {
    username: "Guest",
    imageUrl: smile.src,
  }} />;
};

export default CommunityWrapper;
