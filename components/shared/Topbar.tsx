import { OrganizationSwitcher, SignOutButton, SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/forms/mode-toggle";

function Topbar() {
  const isUserLoggedIn = true;

  return (
    <nav className="topbar flex items-center justify-between px-4 py-2">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/assets/logo.svg" alt="logo" width={28} height={28} />
        <p className="text-heading3-bold text-dark-1 dark:text-light-2 max-xs:hidden">
          CyberSentinal
        </p>
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

        <OrganizationSwitcher
          appearance={{ elements: { organizationSwitcherTrigger: "py-2 px4" } }}
        />
      </div>
    </nav>
  );
}

export default Topbar;