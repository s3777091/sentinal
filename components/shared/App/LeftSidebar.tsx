"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, SignedIn, useAuth } from "@clerk/nextjs";
import { sidebarLinks } from "@/constants";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

const LeftSidebar = () => {
  const pathname = usePathname();
  const { userId } = useAuth();
  const { theme, resolvedTheme } = useTheme();

  // State to check if the theme has been loaded
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          if (link.route === "/profile") link.route = `${link.route}/${userId}`;

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`leftsidebar_link ${
                isActive
                  ? theme === "dark" || resolvedTheme === "dark"
                    ? "bg-primary-500"
                    : "bg-light-3"
                  : ""
              }`}
            >
              <Image
                src={
                  theme === "dark" || resolvedTheme === "dark"
                    ? link.darkImageUrl
                    : link.imgURL
                }
                alt={link.label}
                width={24}
                height={24}
              />

              <p className="max-lg:hidden">{link.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 px-6">
        <SignedIn>
          <SignOutButton redirectUrl="/sign-in">
            <div className="flex cursor-pointer gap-4 p-4">
              <Image
                src={
                  theme === "dark" || resolvedTheme === "dark"
                    ? "/assets/darklogout.svg"
                    : "/assets/logout.svg"
                }
                alt="logout"
                width={24}
                height={24}
              />
              <p className="max-lg:hidden">Logout</p>
            </div>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
};

export default LeftSidebar;