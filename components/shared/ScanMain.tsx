"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScanDisplay } from "@/components/shared/ScanDisplay";
import { ScanList } from "@/components/shared/ScanList";
import { ScanArray, userDetail } from "@/types/types";

interface ScanProps {
  user: userDetail;
  defaultCollapsed?: boolean;
}

export function ScanMain({ user }: ScanProps) {
  const [scans, setScans] = useState<ScanArray[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
      <div className="flex h-full min-h-screen min-w-full">
        {/* Left Panel: Scan List */}
        <div className="w-1/3 border-r border-gray-200">
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-[16px]">
              <h1 className="text-xl font-bold">Scan History</h1>
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
        </div>

        {/* Right Panel: Scan Display */}
        <div className="w-2/3">
          <ScanDisplay
            scan={scans.find((s) => s.id === selectedId) || null}
            user={user}
          />
        </div>
      </div>
      <Separator />
    </TooltipProvider>
  );
}