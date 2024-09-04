import { currentUser } from "@clerk/nextjs/server";
import { ScanMain } from "@/components/shared/ScanMain";
import { redirect } from "next/navigation";
import { getUser } from "@/app/supercode";

const ScanPage = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  
  const uderDetail = await getUser(user);

  return (
    <div className="min-h-[100vh] flex-col md:flex">
      <ScanMain user={uderDetail}/>
    </div>
  );
};

export default ScanPage;
