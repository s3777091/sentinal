"use client";

import * as React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Cookies from 'js-cookie';
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MailDisplay } from "@/components/shared/mail-display";
import { MailList } from "@/components/shared/mail-list";
import { type Mail } from "@/app/(root)/scan/data";
import { userDetail } from "@/types/types";

import { useMail } from "@/app/(root)/scan/use-mail"

interface MailProps {
  user: userDetail;
  mails: Mail[];
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
}

export function Mail(props: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(
    props.defaultCollapsed ?? Cookies.get("react-resizable-panels:collapsed") === "true"
  );

  const [mail] = useMail();

  const layout = Cookies.get("react-resizable-panels:layout")
    ? JSON.parse(Cookies.get("react-resizable-panels:layout") as string)
    : props.defaultLayout ?? [50, 50];

  return (
    <TooltipProvider delayDuration={0}>
      <Separator />
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          Cookies.set("react-resizable-panels:layout", JSON.stringify(sizes));
        }}
        className="h-full min-h-svh min-w-full items-stretch"
      >
        <ResizablePanel defaultSize={layout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-[16px]">
              <h1 className="text-xl font-bold">Scan</h1>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"></div>
            <TabsContent value="all" className="m-0">
              <MailList items={props.mails} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel className="">
          <MailDisplay
            mail={props.mails.find((item) => item.id === mail.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      <Separator />
    </TooltipProvider>
  );
}