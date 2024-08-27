"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Cookies from "js-cookie";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScanDisplay } from "@/components/shared/ScanDisplay";
import { ScanList } from "@/components/shared/ScanList";
import { ScanArray, userDetail } from "@/types/types";

interface MailProps {
  user: userDetail;
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
}

export function ScanMain({ user, defaultLayout, defaultCollapsed }: MailProps) {
  const [scans, setScans] = useState<ScanArray[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const layout = useMemo(() => {
    const savedLayout = Cookies.get("react-resizable-panels:layout");
    return savedLayout ? JSON.parse(savedLayout) : defaultLayout ?? [50, 50];
  }, [defaultLayout]);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: {
              email: user.email,
              username: user.username,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch scans");
        }

        const data: ScanArray[] = await response.json();
        setScans(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load scans");
        setScans([]);
      }
    };

    fetchScans();
  }, [user]);

  const handleSelectScan = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <Separator />
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={useCallback(
          (sizes: number[]) => {
            Cookies.set("react-resizable-panels:layout", JSON.stringify(sizes));
          },
          []
        )}
        className="h-full min-h-svh min-w-full items-stretch"
      >
        <ResizablePanel defaultSize={layout[0]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-[16px]">
              <h1 className="text-xl font-bold">Scan</h1>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"></div>
            <TabsContent value="all" className="m-0">
              {error ? (
                <div className="p-4 text-red-500">{error}</div>
              ) : scans.length === 0 ? (
                <div className="p-4 text-gray-500">No scans available.</div>
              ) : (
                <ScanList items={scans} onSelect={handleSelectScan} />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={layout[1]} minSize={30}>
          <ScanDisplay
            scan={scans.find((s) => s.id === selectedId) || null}
            user={user}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      <Separator />
    </TooltipProvider>
  );
}