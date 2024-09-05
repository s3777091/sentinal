import { currentUser } from "@clerk/nextjs/server";
import { ScanMain } from "@/components/shared/Scan/ScanMain";
import { redirect } from "next/navigation";
import smile from "@/public/img/AI/smile.png";
import { userDetail } from "@/types/types";

const ScanPage = async () => {
  const user = await currentUser();

  // Redirect to sign-in if user is not logged in
  if (!user) {
    redirect("/sign-in");
    return;
  }

  // Prepare the user profile with defaults for missing fields
  const userProfile : userDetail = {
    email: user.emailAddresses[0]?.emailAddress || "ghost@gmail.com",
    username: user.username || "unknown",
    userid: user.id.toString(),
    imageUrl: user.imageUrl || smile.src,
  };
  return (
    <div className="min-h-[100vh] flex-col md:flex">
      <ScanMain user={userProfile} />
    </div>
  );
};

export default ScanPage;
