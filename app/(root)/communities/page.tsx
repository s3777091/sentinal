// server/CommunityWrapper.tsx
import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import Community from "@/components/shared/community";
import { getUser } from "@/app/supercode";
import { redirect } from "next/navigation";

const CommunityWrapper = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const userDetail = await getUser(user);

  return (
    <>
      <h1 className='head-text'>Communities</h1>
      <Community user={userDetail} searchParams={searchParams} />
    </>
  );
};

export default CommunityWrapper;