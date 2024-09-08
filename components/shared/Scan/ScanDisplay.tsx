"use client";
import React, { useState, useMemo } from "react";
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
import ModelSelect from "@/components/forms/ModelSelect";
import { Upload, Github, FolderCog, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "../../ui/scroll-area";

const ADD_SCAN_INPUT = "ADD_SCAN";

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

  const [github, setgithub] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const typeValue = useMemo(() => {
    switch (selectedType) {
      case "Library":
        return "information";
      case "Vulnerable":
        return "vulnerable";
      default:
        return "Library";
    }
  }, [selectedType]);

  const handleSelectType = (value: string) => {
    setSelectedType(value);
  };

  const sendData = async () => {
    try {
      const controller = new AbortController();

      const body: ScanInput = {
        github: github,
        language: language,
        token: token,
        user: user.username,
      };

      const response = await fetch("/api/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      } else {
        alert(
          "GET github -> send that code to GPU SERVER compute and return back take time pls wait"
        );
      }
      const data = await response.json();

      console.log(data);
    } catch (error) {
      console.log("Error occurred:", error);
      alert("Something went wrong when fetching from the API.");
    }
  };

  return (
    <div className="flex min-w-fit h-full max-md:w-1/2 flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
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
                <div className="relative mx-4 mt-2">
                  <Github className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Github link"
                    className="pl-8 pr-4"
                    value={github}
                    onChange={(e) => setgithub(e.target.value)}
                  />
                </div>
                <div className="relative mx-4">
                  <FolderCog className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="language to detect"
                    className="pl-8 pr-4"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                </div>
                <div className="relative mx-4 mb-2">
                  <FolderCog className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="token"
                    className="pl-8 pr-4"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>
              </form>
            </DrawerContent>
          </Drawer>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={sendData}>
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Click to upload</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <form>
                    <div className="relative flex items-center">
                    </div>
                  </form>
                </TooltipTrigger>
              </PopoverTrigger>
            </Popover>
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Separator />
      {scan ? (
        <div className="flex flex-1 flex-col">
          <div className="p-4"></div>
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage
                  alt={user.username}
                  src={user.imageUrl || undefined}
                />
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibol">{user.username}</div>
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
