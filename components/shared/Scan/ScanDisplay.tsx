"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FileContent, ScanInput, UserDetail } from "@/types/types";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { scanInputSchema } from "@/lib/validations/Scan"; // Validation schema

import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

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
    const MAX_PATHS_THRESHOLD = 30; // Define a threshold for max number of paths

    try {
      setLoading(true);

      // Validate the parsedInput using the zod schema
      let body: ScanInput = scanInputSchema.parse(parsedInput);

      

      // Send the request
      let response = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      let data: string[] = await response.json(); // Assuming the API returns an array of file paths (strings)

      // Check if too many paths were returned
      if (data.length > MAX_PATHS_THRESHOLD) {
        toast({
          title: "Too Many Files",
          description: `Too many paths (${data.length}) were found. Switching to normal scan.`,
        });

        // Switch to normal mode and resend the request
        body = { ...body, mode: false }; // Switch to normal mode

        response = await fetch("/api/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        data = await response.json();
      }

      // Check if there are no paths (empty result)
      if (data.length === 0) {
        toast({
          title: "Upload Fail",
          description:
            "Maybe your token expired or language not supported. Try with normal scan.",
        });
      } else {
        toast({
          title: "Upload Success",
          description: "Data successfully sent to the GPU server.",
        });
      }
    } catch (error) {
      // Catch validation or API errors
      toast({
        title: "Upload Fail",
        description: "An unknown error occurred.",
      });
      console.error("Error occurred:", error);
    } finally {
      setLoading(false);
    }
  }, [parsedInput, toast]);

  return (
    <div className="flex min-w-fit h-full max-md:w-1/2 flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          {/* Dropdown menu for choosing scan mode */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-32 md:w-24 lg:w-48 px-2 sm:px-4 md:px-6 lg:px-8 text-sm sm:text-base md:text-lg dark:bg-zinc-950"
                >
                  Mode
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-full max-w-full sm:max-w-md md:max-w-lg overflow-x-auto">
                <DropdownMenuLabel>Scan Mode</DropdownMenuLabel>

                <div className="space-y-4 p-4">
                  <div className="flex items-center space-x-2">
                    {/* Switch between Deep and Normal scan */}
                    <Switch
                      checked={isDeepScan}
                      onCheckedChange={setIsDeepScan}
                      id="scan-switch"
                    />
                    <label
                      htmlFor="scan-switch"
                      className="text-sm font-medium"
                      style={{ width: "60px", textAlign: "center" }} // Adjust the width as needed
                    >
                      {isDeepScan ? "Deep" : "Normal"}
                    </label>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <DrawerHeader className="mx-4">
                <DrawerTitle>Configuration</DrawerTitle>
                <DrawerDescription>
                  Configure the settings for the model and messages.
                </DrawerDescription>
              </DrawerHeader>
              <form className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
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

          {/* Upload button */}
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
      </div>
      <Separator />

      {/* Scan details */}
      {scan ? (
        <div className="flex flex-1 flex-col">
          <div className="p-4"></div>
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
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
          </div>
          <Separator />
          <ScrollArea className="h-[80vh] max-h-[80vh]">
            <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
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
