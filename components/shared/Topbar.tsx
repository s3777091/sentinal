import { RedirectToSignIn, SignOutButton, SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/forms/mode-toggle";

function Topbar() {

  return (
    <nav className="topbar flex items-center justify-between px-4 py-2">
      <Link href="/" className="flex items-center gap-4 mt-6 ml-4">
        <Image src="/img/skira.png" alt="logo" width={128} height={128} />
      </Link>

      <div className="flex items-center gap-4">
        <ModeToggle /> {/* Add the ModeToggle component here */}
        <div className="block md:hidden">
          <SignedIn>
            <SignOutButton>
              <div className="flex cursor-pointer">
                <Image
                  src="/assets/logout.svg"
                  alt="logout"
                  width={24}
                  height={24}
                />
              </div>
            </SignOutButton>
          </SignedIn>
        </div>
        <UserButton
          appearance={{ elements: { organizationSwitcherTrigger: "py-2 px4" } }}
        />
      </div>
    </nav>
  );
}

export default Topbar;
