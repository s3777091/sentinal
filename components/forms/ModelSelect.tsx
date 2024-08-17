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
  onSelectModel: (value: string) => void;
  onSelectType: (Value: string) => void;
}

const ModelSelect = ({ onSelectModel, onSelectType }: Props) => {
  return (
    <fieldset className="grid gap-6 rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-sm font-medium text-light-1">
        Messages
      </legend>

      <div className="grid gap3">
        <Select onValueChange={(value) => onSelectModel(value)}>
          <SelectTrigger
            id="model"
            className="items-start [&_[data-description]]:hidden"
          >
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Rabbit">
              <div className="flex items-start gap-3 text-muted-foreground">
                <Rabbit className="w-6 h-6" />
                <div className="grid gap-0.5">
                  <p>
                    Neural{" "}
                    <span className="font-medium text-foreground">Rabbit</span>
                  </p>
                  <p className="text-xs" data-description>
                    Our fastest compute for general use cases.
                  </p>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="Bird">
              <div className="flex items-start gap-3 text-muted-foreground">
                <Bird className="w-6 h-6" />
                <div className="grid gap-0.5">
                  <p>
                    Neural{" "}
                    <span className="font-medium text-foreground">Bird</span>
                  </p>
                  <p className="text-xs" data-description>
                    Performance and speed for efficiency.
                  </p>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap3">
        <Select onValueChange={(value) => onSelectType(value)}>
          <SelectTrigger
            id="model"
            className="items-start [&_[data-description]]:hidden"
          >
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Library">
              <div className="flex items-start gap-3 text-muted-foreground">
                <Library className="w-6 h-6" />
                <div className="grid gap-0.5">
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
                <div className="grid gap-0.5">
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
            <SelectItem value="Message">
              <div className="flex items-start gap-3 text-muted-foreground">
                <MessageSquare className="w-6 h-6" />
                <div className="grid gap-0.5">
                  <p>
                    Neural{" "}
                    <span className="font-medium text-foreground">Message</span>
                  </p>
                  <p className="text-xs" data-description>
                    Can chat about anything
                  </p>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="max-w-full lg:max-w-3xl">
        <CardHeader className="px-5">
          <CardTitle>History</CardTitle>
          <CardDescription>Save vulnerable chat</CardDescription>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[280px]">
          {" "}
          {/* Increase height here */}
          <Table className="w-full">
            <TableBody>
              {/* Example rows */}
              <TableRow className="bg-accent">
                <TableCell>
                  <div className="font-medium">cROS Bug</div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">cROS Bug</div>
                </TableCell>
              </TableRow>
              {/* Add more rows as needed */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </fieldset>
  );
};

export default ModelSelect;
