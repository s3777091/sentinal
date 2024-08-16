import { TooltipProvider } from "@/components/ui/tooltip";
import MainChat from "@/components/shared/MainChat";
import { UserDetailUpdate } from "../supercode";
import smile from "@/public/img/AI/smile.png";

const Home = async () => {
  const [useDetail] = await Promise.all([UserDetailUpdate()]);

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
