import { currentUser } from "@clerk/nextjs/server";
import Community from "@/components/shared/community";
import { getUser } from "@/app/supercode";
import { redirect } from "next/navigation";
import { useUserStore } from "@/lib/store";

const CommunityWrapper = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { userDetail } = useUserStore.getState();

  if (!userDetail) {
    await getUser(user);
  }

  return (
    <>
      <h1 className="head-text">Communities</h1>
      <Community searchParams={searchParams} />
    </>
  );
};

export default CommunityWrapper;
