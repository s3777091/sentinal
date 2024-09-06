"use client";

import { SignedIn, UserButton, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use next/navigation instead of next/router
import { ModeToggle } from "@/components/forms/mode-toggle";

function Topbar() {
  const router = useRouter(); // Now using next/navigation's useRouter

  const handleSignOut = async () => {
    try {
      const { signOut } = useClerk();
      await signOut(); // Perform sign-out
      router.push("/sign-in"); // Redirect to sign-in page after logging out
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <nav className="topbar flex items-center justify-between px-4 py-2">
      <Link href="/" className="flex items-center gap-4 mt-6 ml-4">
        <Image src="/img/skira.png" alt="logo" width={128} height={128} />
      </Link>

      <div className="flex items-center gap-4">
        <ModeToggle /> {/* Add the ModeToggle component here */}
        <div className="block md:hidden">
          <SignedIn>
            <div className="flex cursor-pointer" onClick={handleSignOut}>
              <Image
                src="/assets/logout.svg"
                alt="logout"
                width={24}
                height={24}
              />
            </div>
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