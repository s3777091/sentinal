"use client";

import React, { useState, useMemo, useReducer, useEffect, useRef } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Settings, Share, Loader } from "lucide-react";
import ModelSelect from "@/components/forms/ModelSelect";
import ChatMessage from "@/components/forms/ChatMessage";
import { AIMessage, ChatBody, KafkaBody, userDetail } from "@/types/types";
import aiChat from "@/public/img/AI/sparkling.png";
import { CyberCloud } from "@dad1909/cybersoda";
import { userAgent } from "next/server";

const ADD_MESSAGE = "ADD_MESSAGE";

interface Message {
  user: userDetail;
  message: string;
}
interface AddMessageAction {
  type: typeof ADD_MESSAGE;
  payload: Message;
}
type MessagesState = Message[];

const messagesReducer = (
  state: MessagesState,
  action: AddMessageAction
): MessagesState => {
  switch (action.type) {
    case ADD_MESSAGE:
      return [...state, action.payload];
    default:
      return state;
  }
};

interface Props {
  user: userDetail;
}

const MainChat = (props: Props) => {
  const [selectedType, setSelectedType] = useState<string>("");
  const [messages, dispatch] = useReducer(messagesReducer, []); // Initialize messages state
  const [loading, setLoading] = useState<boolean>(false);

  const typeValue = useMemo(() => {
    switch (selectedType) {
      case "Library":
        return "information";
      case "Vulnerable":
        return "vulnerable";
      default:
        return "vulnerable";
    }
  }, [selectedType]);

  const handleMessage = async (message: string) => {
    dispatch({ type: ADD_MESSAGE, payload: { user: props.user, message } });
    const controller = new AbortController();

    if (message.length > 700) {
      alert(
        `Please enter code less than 700 characters. You are currently at ${message.length} characters.`
      );
      return;
    }

    setLoading(true);
    const body: ChatBody = {
      inputMessage: message,
      prompType: typeValue,
      length: 256,
      serverSend: props.user.server,
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch the API.");
      }

      const data = await response.json();
      dispatch({
        type: ADD_MESSAGE,
        payload: {
          user: {
            email: props.user.email,
            username: "AI",
            imageUrl: aiChat.src,
            server: props.user.server,
          },
          message: data.result,
        },
      });

      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong when fetching from the API.");
      setLoading(false);
    }
  };

  const handleSelectType = (value: string) => {
    setSelectedType(value);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 flex h-[50px] items-center gap-1 border-b px-4">
        <h1 className="head-text">Workspace</h1>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" style={{ color: "white" }}>
              <Settings className="w-5 h-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>Configuration</DrawerTitle>
              <DrawerDescription>
                Configure the settings for the model and messages.
              </DrawerDescription>
            </DrawerHeader>
            <form className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
              <ModelSelect onSelectType={handleSelectType} />
            </form>
          </DrawerContent>
        </Drawer>
        <Button variant="outline" size="sm" className="ml-auto gap-1.5 text-sm">
          <Share className="w-5 h-5" />
          Save
        </Button>
      </header>

      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <ChatMessage
          users={props.user}
          onButtonClick={handleMessage} // Call handleButtonClick on button click
          messages={messages}
        />

        {loading && (
          <div className="flex justify-center items-center">
            <div className="loader"></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainChat;