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
import { checkToken, isLanguageSupported, isValidGithubUrl } from "@/lib/action/github.action";

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
  const [isDeepScan, setIsDeepScan] = useState(false);

  const { toast } = useToast();

  // Preparing the input for the scan
  const parsedInput = useMemo(
    () => ({
      github,
      language,
      token,
      mode: isDeepScan,
    }),
    [github, language, token, isDeepScan]
  );


  // Function for sending GitHub data to the server
  const sendData = useCallback(async () => {
    const MAX_PATHS_THRESHOLD = 30;
    let data: string[];

    try {
      // Validate token, language, and GitHub URL
      if (
        !checkToken(parsedInput.token) ||
        !isLanguageSupported(parsedInput.language) ||
        !isValidGithubUrl(parsedInput.github)
      ) {
        toast({
          variant: "destructive",
          title: "Invalid Format",
          description: "Please provide a valid GitHub URL or supported language.",
        });
        return;
      } else {
        let body: ScanInput = { ...parsedInput };
        setLoading(true);

        // First API call for GitHub data
        let response = await fetch("/api/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        data = await response.json();
        if (data.length > MAX_PATHS_THRESHOLD) {
          toast({
            title: "Too Many Files",
            description: `Too many paths (${data.length}) found. Switching to normal scan.`,
          });

          body = { ...body, mode: false };

          response = await fetch("/api/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
        }
      }

      // Handle empty data or success response
      if (data.length === 0) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "No files found. Token may have expired.",
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
        description: "An error occurred while uploading.",
      });
    } finally {
      setLoading(false);
    }
  }, [parsedInput, toast]);

  return (
    <div className="flex min-w-fit h-full flex-col max-md:w-1/2">
      <div className="flex items-center p-2 gap-2">
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isDeepScan}
              onCheckedChange={setIsDeepScan}
              id="scan-switch"
            />
            <label htmlFor="scan-switch" className="text-sm font-medium text-center w-16">
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
              <DrawerDescription>Configure the GitHub details.</DrawerDescription>
            </DrawerHeader>
            <form className="grid w-full gap-6 overflow-auto p-4 pt-0">
              <InputField
                icon={<Github className="h-4 w-4 text-muted-foreground" />}
                placeholder="GitHub link"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
              <InputField
                icon={<FolderCog className="h-4 w-4 text-muted-foreground" />}
                placeholder="Language"
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
            <Button variant="ghost" size="icon" onClick={sendData} disabled={loading}>
              <Upload className="h-4 w-4" />
              <span className="sr-only">Upload</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Click to upload</TooltipContent>
        </Tooltip>
      </div>


      <Separator />
      {/* Display scan details */}
      
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
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ icon, placeholder, value, onChange }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3">{icon}</span>
    <Input
      className="pl-8 pr-4"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);
