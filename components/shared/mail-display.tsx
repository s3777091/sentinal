"use client";

import { type ChartConfig } from "@/components/ui/chart";
import { Component, Component2 } from "@/components/ui/circle-chart";
import { Save, Upload, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mail } from "@/app/(root)/scan/data";
import { ScrollArea } from "../ui/scroll-area";

interface MailDisplayProps {
  mail: Mail | null;
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export function MailDisplay({ mail }: MailDisplayProps) {


  const sendScanData = async (message: string) => {
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
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error("Failed to fetch the API.");
      }

      console.log("best");


    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong when fetching from the API.");
    }
  };

  return (
    <div className="flex min-w-fit h-full max-md:w-1/2 flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
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
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  {mail.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.name}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mail.email}
                </div>
              </div>
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-[25vh]">
            <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
              {mail.text}
            </div>
          </ScrollArea>
          <div className="flex">
            <Component />
            <Separator orientation="vertical" />
            <Component2 />
          </div>
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  className="p-4"
                  placeholder={`Reply ${mail.name}...`}
                />
                <div className="flex items-center">
                  <Button
                    // onClick={sendScanData}
                    size="sm"
                    className="ml-auto"
                  >
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
