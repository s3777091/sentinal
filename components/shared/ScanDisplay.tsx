"use client";
import React, { useState, useEffect } from "react";
import { userDetail } from "@/types/types";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Save, Upload, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "../ui/scroll-area";

interface ScanDisplayProps {
  scan: {
    id: number;
    title: string;
    detail: string;
  } | null;
  user: userDetail;
}

export function ScanDisplay({ scan, user }: ScanDisplayProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scan && user) {
      console.log(scan.title);
      console.log(user.email);
    }
  }, [scan, user]);

  const sendScanData = async (message: string) => {
    console.log("User's input message:", message);

    const controller = new AbortController();

    if (message.length > 700) {
      alert(
        `Please enter code less than 700 characters. You are currently at ${message.length} characters.`
      );
      return;
    }

    try {
      const response = await fetch("/api/kafka", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch the API.");
      }

      console.log("Message successfully sent to the API.");
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong when fetching from the API.");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const inputElement = event.currentTarget.querySelector(
      'textarea[name="userMessage"]'
    ) as HTMLTextAreaElement;

    if (inputElement) {
      sendScanData(inputElement.value);
      inputElement.value = "";
    }
  };

  return (
    <div className="flex min-w-fit h-full max-md:w-1/2 flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!scan}>
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!scan}>
                <Save className="h-4 w-4" />
                <span className="sr-only">Save</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <form>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search" className="pl-8" />
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
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage
                  alt={user.username}
                  src={user.imageUrl || undefined}
                />
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibol">
                  {user.username}
                </div>
                <div className="line-clamp-1 text-xs">{scan.title}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {user.email}
                </div>
              </div>
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-[25vh]">
            <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
              {scan.detail}
            </div>
          </ScrollArea>
          <div className="p-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <Textarea
                  className="p-4"
                  name="userMessage"
                  placeholder={`Reply to ${user.username}...`}
                />
                <div className="flex items-center">
                  <Button type="submit" size="sm" className="ml-auto">
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}
