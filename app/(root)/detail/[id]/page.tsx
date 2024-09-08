import { Suspense } from "react";
import { redirect } from "next/navigation";

import { currentUser } from "@clerk/nextjs/server";
import PostDetailComponent from "@/components/shared/Post/PostDetail";
import Loading from "@/components/Loading/Loading";
import { getPostDetail } from "@/lib/action/post.action";

export const revalidate = 0;

async function Page({ params }: { params: { id: string } }) {
  // Fetch user and post data in parallel
  const [user, post] = await Promise.all([currentUser(), getPostDetail(params.id)]);

  // Redirect to sign-in if user is not logged in
  if (!user) {
    redirect("/sign-in");
  }

  // Handle post not found
  if (!post) {
    return (
      <section className="relative">
        <h1 className="head-text">Post Not Found</h1>
      </section>
    );
  }

  return (
    <section className="relative">
      <Suspense fallback={<Loading />}>
        <PostDetailComponent post={post} />
      </Suspense>
    </section>
  );
}

export default Page;