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
import { Upload, Github, FolderCog, Settings, File as FileIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
import smile from "@/public/img/AI/smile.png";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { checkToken, isLanguageSupported, isValidGithubUrl } from "@/lib/action/github.action";
import { useDropzone } from "react-dropzone"; // Import for file drop

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // File state

  const { toast } = useToast();

  // Preparing the input for the scan
  const parsedInput = useMemo(
    () => ({
      github,
      language,
      token,
      user: user.username,
      mode: isDeepScan,
    }),
    [github, language, token, user.username, isDeepScan]
  );

  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const fileReader = new FileReader();

      fileReader.onload = () => {
        const fileContent = fileReader.result as string;
        const newFile = new Blob([fileContent], { type: "text/plain" });
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".txt";
        const textFile = new File([newFile], newFileName, { type: "text/plain" });
        setSelectedFile(textFile);
      };

      fileReader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      ".js": [], ".jsx": [], ".ts": [], ".tsx": [], ".py": [],
      ".java": [], ".cpp": [], ".c": [], ".h": [], ".php": [],
      ".rb": [], ".go": [], ".swift": [], ".html": [], ".css": [],
      ".scss": [], ".json": [], ".yaml": [], ".xml": [], ".md": [],
    },
  });

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

  // Function to handle file uploads to the server
  const uploadFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/save-file-link", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File upload failed with status ${response.status}`);
      }

      const result = await response.json();
      toast({
        title: "File Upload Successful",
        description: "File uploaded successfully.",
      });
      console.log(result);
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        variant: "destructive",
        title: "File Upload Failed",
        description: "Error uploading file.",
      });
    }
  };

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

      {/* File drag-and-drop area and submit button */}
      <div className="flex items-center gap-2 mt-4">
        <div
          {...getRootProps()}
          className="flex flex-col items-center justify-center border h-24 w-24 rounded-md cursor-pointer p-2 border-dashed"
        >
          <input {...getInputProps()} className="hidden" />
          <FileIcon className="h-6 w-6 mb-2" />
          <span className="text-xs text-center">Upload file</span>
        </div>
        {selectedFile && <div className="text-sm mt-2">{selectedFile.name}</div>}

        <Button variant="ghost" size="icon" onClick={uploadFile} disabled={!selectedFile}>
          <Upload className="h-4 w-4" />
          <span className="sr-only">Submit</span>
        </Button>
      </div>

      {/* Display scan details */}
      {scan ? (
        <ScrollArea className="h-full max-h-[800px]">
          <div className="p-6">
            <h2 className="font-semibold text-lg">{scan.title}</h2>
            <Separator className="my-4" />
            <p className="text-sm">{scan.more_detail}</p>
            <p className="text-muted-foreground text-xs">{scan.level}</p>
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col h-full items-center justify-center">
          <Avatar className="w-1/4 h-1/4">
            <AvatarImage src={smile.src} alt="Placeholder" />
          </Avatar>
          <p className="text-sm text-muted-foreground">No scan performed yet</p>
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
      className="pl-10"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);
