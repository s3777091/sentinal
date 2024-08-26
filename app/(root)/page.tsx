import { TooltipProvider } from "@/components/ui/tooltip";
import MainChat from "@/components/shared/MainChat";
import { UserDetailUpdate } from "../supercode";
import smile from "@/public/img/AI/smile.png";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

const Home = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userDetail = await UserDetailUpdate(user);
  return (
    <TooltipProvider>
      <div className="grid h-screen w-full">
        <MainChat
          user={
            userDetail || {
              email: "anonymus@gmail.com",
              username: "Guest",
              imageUrl: smile.src
            }
          }
        />
      </div>
    </TooltipProvider>
  );
};

export default Home;