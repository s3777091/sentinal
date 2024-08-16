"use client"

import * as React from "react"
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MailDisplay } from "@/components/shared/mail-display"
import { MailList } from "@/components/shared/mail-list"
import { type Mail } from "@/app/(root)/scan/data"
import { useMail } from "@/app/(root)/scan/use-mail"

interface MailProps {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  mails: Mail[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
}

export function Mail({
  accounts,
  mails,
  defaultLayout = [70,30],
  defaultCollapsed = false,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail] = useMail()

  return (
    <TooltipProvider delayDuration={0}>
      <Separator />
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-full min-h-svh min-w-full items-stretch"
      >
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-[16px]">
              <h1 className="text-xl font-bold">Scan</h1>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            </div>
            <TabsContent value="all" className="m-0">
              <MailList items={mails} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle/>
        <ResizablePanel className="">
          <MailDisplay
            mail={mails.find((item) => item.id === mail.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      <Separator />
    </TooltipProvider>
  )
}
