import { Suspense } from "react";
import { redirect } from "next/navigation";

import { currentUser } from "@clerk/nextjs/server";
import Loading from "@/components/Loading/Loading";
import smile from "@/public/img/AI/smile.png";
import PostEdit from "@/components/forms/Post/PostEdit";

export const revalidate = 0;

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();

  // Redirect to sign-in if user is not logged in
  if (!user) {
    redirect("/sign-in");
  }

  // Prepare the user profile with defaults for missing fields
  const userProfile = {
    email: user.emailAddresses[0]?.emailAddress || "ghost@gmail.com",
    username: user.username || "unknown",
    userid: user.id.toString(),
    imageUrl: user.imageUrl || smile.src,
  };

  // Handle post not found
  return (
    <section className="relative">
      <Suspense fallback={<Loading />}>
        <h1 className="head-text">Edit Post</h1>
        <PostEdit user={userProfile} postID={params.id} />
      </Suspense>
    </section>
  );
}

export default Page;
