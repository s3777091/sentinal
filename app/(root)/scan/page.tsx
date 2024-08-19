import Cookies from "js-cookie";
import { currentUser } from "@clerk/nextjs/server";
import { Mail } from "@/components/shared/mail";
import { accounts, mails } from "@/app/(root)/scan/data";
import { redirect } from "next/navigation";
import { getScanList, getUser } from "@/app/supercode";

const ScanPage = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const uderDetail = await getUser(user);

  if (!uderDetail) {
    redirect("/sign-in");
  }
  const listScan = await getScanList(uderDetail);


  const parseJSON = (value: string) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return undefined;
    }
  };

  const layout = Cookies.get("react-resizable-panels:layout");
  const collapsed = Cookies.get("react-resizable-panels:collapsed");

  return (
    <div className="min-h-[100vh] flex-col md:flex">
      <Mail
        user={uderDetail}
        mails={mails} // listScan
        defaultLayout={layout ? parseJSON(layout) : undefined}
        defaultCollapsed={collapsed ? parseJSON(collapsed) : undefined}
      />
    </div>
  );
};

export default ScanPage;
