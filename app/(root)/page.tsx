import { TooltipProvider } from "@/components/ui/tooltip";
import MainChat from "@/components/shared/MainChat";
import { getUser } from "../supercode";
import smile from "@/public/img/AI/smile.png";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

const Home = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const uderDetail = await getUser(user);
  return (
    <TooltipProvider>
      <div className="grid h-screen w-full">
        <MainChat
          user={uderDetail}
        />
      </div>
    </TooltipProvider>
  );
};

export default Home;
