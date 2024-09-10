"use client";
import React, { useState, useCallback, useMemo } from "react";
import { ScanInput, UserDetail } from "@/types/types";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload, Github, FolderCog, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
import smile from "@/public/img/AI/smile.png";

import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  checkToken,
  isLanguageSupported,
  isValidGithubUrl,
} from "@/lib/action/github.action";
import { NextResponse } from "next/server";

interface ScanDisplayProps {
  scan: {
    id: number;
    title: string;
    level: string;
    more_detail: string;
  } | null;
  user: UserDetail;
}

export function ScanDisplay({ scan, user }: ScanDisplayProps) {
  const [loading, setLoading] = useState(false);
  const [github, setGithub] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [token, setToken] = useState<string>("");
  // Filter state for the scan mode switch (Deep or Normal)
  const [isDeepScan, setIsDeepScan] = useState(false);

  const { toast } = useToast(); // Initialize the toast

  // Preparing the input for the scan, including the scan mode
  const parsedInput = useMemo(
    () => ({
      github,
      language,
      token,
      user: user.username,
      mode: isDeepScan, // Pass as a boolean
    }),
    [github, language, token, user.username, isDeepScan]
  );

  const sendData = useCallback(async () => {
    const MAX_PATHS_THRESHOLD = 30;

    let data: string[];

    try {
      // Validate token
      if (
        !checkToken(parsedInput.token) ||
        !isLanguageSupported(parsedInput.language) ||
        !isValidGithubUrl(parsedInput.github)
      ) {
        toast({
          variant: "destructive",
          title: "Invalid Format",
          description:
            "Please provide a valid GitHub URL following the pattern: https://github.com/{owner}/{repo}/{branch}. or Please provide a valid and supported language format.",
        });
        return;
      } else {
        let body: ScanInput = { ...parsedInput };
        setLoading(true);

        // Send the request to the GitHub API
        let response = await fetch("/api/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        data = await response.json();
        // Check if too many paths were returned
        if (data.length > MAX_PATHS_THRESHOLD) {
          toast({
            title: "Too Many Files",
            description: `Too many paths (${data.length}) were found. Switching to normal scan.`,
          });

          // Switch to normal mode and resend the request
          body = { ...body, mode: false };

          response = await fetch("/api/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            throw new Error(
              `API request failed with status ${response.status}`
            );
          }
        }
      }
      // Check if there are no paths (empty result)
      if (data.length === 0) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description:
            "No files were found. Your token may have expired, or the language might not be supported. Please try again with normal scan mode.",
        });
      } else {
        toast({
          title: "Upload Successful",
          description: "Data successfully sent to the GPU server.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description:
          "An error occurred while uploading. Please check your inputs and try again.",
      });
      return new NextResponse(
        JSON.stringify({
          data: "Scan Error our development have been seen in sentry",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    } finally {
      setLoading(false);
    }
  }, [parsedInput, toast]);

  return (
    <div className="flex min-w-fit h-full flex-col max-md:w-1/2">
      <div className="flex items-center p-2 gap-2">
        {/* Dropdown and Switch for Scan Mode */}
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            {/* Switch between Deep and Normal scan */}
            <Switch
              checked={isDeepScan}
              onCheckedChange={setIsDeepScan}
              id="scan-switch"
            />
            <label
              htmlFor="scan-switch"
              className="text-sm font-medium text-center w-16" // Adjusted width for better control
            >
              {isDeepScan ? "Deep" : "Normal"}
            </label>
          </div>
        </div>

        {/* Drawer for configuration */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader className="px-4">
              <DrawerTitle>Configuration</DrawerTitle>
              <DrawerDescription>
                Configure the github to detect vulnerable sofware code.
              </DrawerDescription>
            </DrawerHeader>
            <form className="grid w-full gap-6 overflow-auto p-4 pt-0">
              <InputField
                icon={<Github className="h-4 w-4 text-muted-foreground" />}
                placeholder="Github link"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
              <InputField
                icon={<FolderCog className="h-4 w-4 text-muted-foreground" />}
                placeholder="Language to detect"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
              <InputField
                icon={<FolderCog className="h-4 w-4 text-muted-foreground" />}
                placeholder="Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </form>
          </DrawerContent>
        </Drawer>

        {/* Upload Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={sendData}
              disabled={loading}
            >
              <Upload className="h-4 w-4" />
              <span className="sr-only">Upload</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Click to upload</TooltipContent>
        </Tooltip>
      </div>

      {/* Separator */}
      <Separator />

      {/* Scan details */}
      {scan ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4 gap-4 text-sm">
            <Avatar>
              <AvatarImage
                alt={user.username}
                src={user.imageUrl || smile.src}
              />
            </Avatar>
            <div className="grid gap-1">
              <div className="font-semibold">{user.username}</div>
              <div className="line-clamp-1 text-xs">{scan.title}</div>
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-[80vh] max-h-[80vh] p-4">
            <div className="whitespace-pre-wrap text-sm">
              {scan.more_detail}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}

interface InputFieldProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
  icon,
  placeholder,
  value,
  onChange,
}: InputFieldProps) => (
  <div className="relative mx-4 mt-2">
    <div className="absolute left-2 top-2.5">{icon}</div>
    <Input
      placeholder={placeholder}
      className="pl-8 pr-4"
      value={value}
      onChange={onChange}
    />
  </div>
);
