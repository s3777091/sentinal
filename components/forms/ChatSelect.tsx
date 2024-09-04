"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Rabbit,
  Bird,
  Turtle,
  Library,
  BugOff,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  onSelectType: (Value: string) => void;
}

const ChatSelect = ({ onSelectType }: Props) => {
  return (
      <div className="grid gap-3 ml-6">
        <Select onValueChange={(value) => onSelectType(value)}>
          <SelectTrigger
            id="Chat"
            className="items-start [&_[data-description]]:hidden"
          >
            <SelectValue placeholder="Select a prompts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Library">
              <div className="flex items-start gap-3 text-muted-foreground">
                <Library className="w-6 h-6" />
                <div className="grid">
                  <p>
                    Neural{" "}
                    <span className="font-medium text-foreground">Library</span>
                  </p>
                  <p className="text-xs" data-description>
                    Give all information and detail
                  </p>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="Vulnerable">
              <div className="flex items-start gap-3 text-muted-foreground">
                <BugOff className="w-6 h-6" />
                <div className="grid">
                  <p>
                    Neural{" "}
                    <span className="font-medium text-foreground">
                      Vulnerable
                    </span>
                  </p>
                  <p className="text-xs" data-description>
                    Detect about sofware vulnerable.
                  </p>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
  );
};

export default ChatSelect;
