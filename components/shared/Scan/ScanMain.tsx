"use client";

import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { ScanDisplay } from "@/components/shared/Scan/ScanDisplay";
import { ScanList } from "@/components/shared/Scan/ScanList";
import { ScanArray, UserDetail } from "@/types/types";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading/Loading";  // Assuming you have a Loading component

interface ScanProps {
  user: UserDetail;
}

export function ScanMain({ user }: ScanProps) {
  const [scans, setScans] = useState<ScanArray[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Filter state for the new switch
  const [isDeepScan, setIsDeepScan] = useState(false);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/scan?userId=${user.userid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch scans");
        }

        const data: ScanArray[] = await response.json();
        setScans(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load scans");
        setLoading(false);
        setScans([]);
      }
    };

    if (user.userid) {
      fetchScans();
    }
  }, [user]);

  const handleSelectScan = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  // Modular filter logic based on the switch state
  const filteredScans = useMemo(() => {
    return scans.filter(scan =>
      isDeepScan ? scan.severity === "Deep" : scan.severity === "Normal"
    );
  }, [scans, isDeepScan]);

  return (
    <TooltipProvider delayDuration={0}>
      <Separator />
      <div className="flex h-full min-h-screen min-w-full">
        {/* Left Panel: Scan List */}
        <div className="w-1/3 border-r border-gray-200">
          <Tabs defaultValue="all">
            <div className="relative flex items-center justify-between p-2">
              <h1 className="text-xl font-bold">Scan History</h1>

              {/* Dropdown Menu for Filter */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-32 md:w-24 lg:w-48 px-2 sm:px-4 md:px-6 lg:px-8 text-sm sm:text-base md:text-lg dark:bg-zinc-950"
                    >
                      Mode
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-full max-w-full sm:max-w-md md:max-w-lg overflow-x-auto">
                    <DropdownMenuLabel>Type</DropdownMenuLabel>

                    <div className="space-y-4 p-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={isDeepScan}
                          onCheckedChange={setIsDeepScan}
                          id="scan-switch"
                        />
                        <label
                          htmlFor="scan-switch"
                          className="text-sm font-medium"
                          style={{ width: "60px", textAlign: "center" }}  // Adjust the width as needed
                        >
                          {isDeepScan ? "Deep" : "Normal"}
                        </label>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Separator />

            <TabsContent value="all" className="m-0">
              <Suspense fallback={<Loading />}>
                {error ? (
                  <div className="p-4 text-red-500">{error}</div>
                ) : scans.length === 0 ? (
                  <div className="p-4 text-gray-500">No scans available.</div>
                ) : (
                  <ScanList items={filteredScans} onSelect={handleSelectScan} />
                )}
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: Scan Display */}
        <div className="w-2/3">
          <Suspense fallback={<Loading />}>
            <ScanDisplay scan={scans.find((s) => s.id === selectedId) || null} user={user} />
          </Suspense>
        </div>
      </div>
      <Separator />
    </TooltipProvider>
  );
}
