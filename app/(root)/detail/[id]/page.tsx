import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getPostDetail, getUser } from "@/app/supercode"; // Import the type
import { currentUser } from "@clerk/nextjs/server";
import Loading from "../../communities/loading";
import PostDetailComponent from "@/components/shared/PostDetail";
import { PostDetail } from "@/types/types";

export const revalidate = 0;

async function Page({ params }: { params: { id: string } }) {
  // Get the current user
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userDetail = await getUser(user);

  // Fetch the post details with author and comments
  const post: PostDetail | null = await getPostDetail(params.id);

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
        <PostDetailComponent post={post} user={userDetail} />
      </Suspense>
    </section>
  );
}

export default Page;