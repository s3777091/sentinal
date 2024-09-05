import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getPostDetail } from "@/app/supercode";
import { currentUser } from "@clerk/nextjs/server";
import PostDetailComponent from "@/components/shared/Post/PostDetail";
import { PostDetail } from "@/types/types";
import Loading from "@/components/Loading/Loading";

export const revalidate = 0;

async function Page({ params }: { params: { id: string } }) {
  // Fetch user and post data in parallel
  const [user, post] = await Promise.all([currentUser(), getPostDetail(params.id)]);

  // Redirect to sign-in if user is not logged in
  if (!user) {
    redirect("/sign-in");
    return;
  }

  // Handle post not found
  if (!post) {
    return (
      <section className="relative">
        <h1 className="head-text">Post Not Found</h1>
      </section>
    );
  }

  const userProfile = {
    email: user.emailAddresses[0]?.emailAddress || "ghost@gmail.com",
    username: user.username || "unknown",
    userid: user.id.toString(),
    imageUrl: user.imageUrl
  };

  return (
    <section className="relative">
      <Suspense fallback={<Loading />}>
        <PostDetailComponent post={post} user={userProfile} />
      </Suspense>
    </section>
  );
}

export default Page;