import { TooltipProvider } from "@/components/ui/tooltip";
import MainChat from "@/components/shared/Chat/MainChat";
import smile from "@/public/img/AI/smile.png";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

const Chat = async () => {
  const user = await currentUser();

  // Redirect to sign-in if user is not logged in
  if (!user) {
    redirect("/sign-in");
    return;
  }

  // Prepare the user profile with defaults for missing fields
  const userProfile = {
    email: user.emailAddresses[0]?.emailAddress || "ghost@gmail.com",
    username: user.username || "unknown",
    userid: user.id.toString(),
    imageUrl: user.imageUrl || smile.src,
  };
  return (
    <TooltipProvider>
      <div className="grid h-  w-full">
        <MainChat user={userProfile} />
      </div>
    </TooltipProvider>
  );
};

export default Chat;
