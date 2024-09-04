import { redirect } from "next/navigation";
import { getUser } from "@/app/supercode";
import { currentUser } from "@clerk/nextjs/server";
import smile from "@/public/img/AI/smile.png";
import PostForm from "@/components/forms/PostForms";

async function Page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const uderDetail = await getUser(user);

  return (
    <>
      <h1 className="head-text">New Security vulnerability</h1>

      <PostForm user={uderDetail}/>
    </>
  );
}

export default Page;
