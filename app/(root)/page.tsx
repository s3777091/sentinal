import Community from "@/components/shared/community";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import smile from "@/public/img/AI/smile.png";


const Home = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const user = await currentUser();

  // Redirect to sign-in if user is not logged in
  if (!user) {
    redirect("/sign-in");
  }

  const userProfile = {
    email: user.emailAddresses[0]?.emailAddress || "ghost@gmail.com",
    username: user.username || "unknown",
    userid: user.id.toString(),
    imageUrl: user.imageUrl || smile.src,
  };


  return (
    <>
      <h1 className="head-text">Communities</h1>
      <Community searchParams={searchParams} userName={userProfile.username} />
    </>
  );
};

export default Home;
