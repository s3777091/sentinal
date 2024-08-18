import { TooltipProvider } from "@/components/ui/tooltip";
import MainChat from "@/components/shared/MainChat";
import { UserDetailUpdate } from "../supercode";
import smile from "@/public/img/AI/smile.png";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { CyberCloud } from "@dad1909/cybersoda";
import { resolve } from "path";

const Home = async () => {
  const user = await currentUser();

  let useDetail = null;

  if (!user) {
    redirect("/sign-in");
    return null;
  } else {
    [useDetail] = await Promise.all([UserDetailUpdate(user)]);
  }
  return (
    <TooltipProvider>
      <div className="grid h-screen w-full">
        <MainChat
          user={
            useDetail || {
              username: "Guest",
              imageUrl: smile.src,
            }
          }
        />
      </div>
    </TooltipProvider>
  );
};

export default Home;