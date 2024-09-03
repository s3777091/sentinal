"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { ScanDisplay } from "@/components/shared/ScanDisplay";
import { ScanList } from "@/components/shared/ScanList";
import { ScanArray, userDetail } from "@/types/types";
import { Button } from "@/components/ui/button";  // Assuming Button is used for the dropdown trigger

interface ScanProps {
  user: userDetail;
}

export function ScanMain({ user }: ScanProps) {
  const [scans, setScans] = useState<ScanArray[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Filter state
  const [filterCritical, setFilterCritical] = useState(false);
  const [filterHigh, setFilterHigh] = useState(false);
  const [filterMedium, setFilterMedium] = useState(false);

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

  // Filter logic
  const filteredScans = scans.filter((scan) => {
    if (filterCritical && scan.severity !== "Critical") return false;
    if (filterHigh && scan.severity !== "High") return false;
    if (filterMedium && scan.severity !== "Medium") return false;
    return true;
  });

  return (
    <TooltipProvider delayDuration={0}>
      <Separator />
      <div className="flex h-full min-h-screen min-w-full">
        {/* Left Panel: Scan List */}
        <div className="w-1/3 border-r border-gray-200">
          <Tabs defaultValue="all">
            <div className="flex items-center justify-between px-4 py-[16Spx]">
              <h1 className="text-xl font-bold">Scan History</h1>

              {/* Dropdown Menu for Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Level Filter</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Types</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filterCritical}
                    onCheckedChange={setFilterCritical}
                  >
                    Critical
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterHigh}
                    onCheckedChange={setFilterHigh}
                  >
                    High
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterMedium}
                    onCheckedChange={setFilterMedium}
                  >
                    Medium
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Separator />

            <TabsContent value="all" className="m-0">
              {error ? (
                <div className="p-4 text-red-500">{error}</div>
              ) : scans.length === 0 ? (
                <div className="p-4 text-gray-500">No scans available.</div>
              ) : (
                <ScanList items={filteredScans} onSelect={handleSelectScan} />
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
