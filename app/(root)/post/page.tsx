import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import PostForm from "@/components/forms/Post/PostForms";
import smile from "@/public/img/AI/smile.png";

async function Page() {
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
    imageUrl: user.imageUrl || smile.src
  };

  return (
    <>
      <h1 className="head-text">New Security Vulnerability</h1>
      <PostForm user={userProfile} />
    </>
  );
}

export default Page;