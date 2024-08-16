"use client";

import React, { useState, useMemo, useReducer } from "react";
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
import { ChatBody, userDetail } from "@/types/types";
import aiChat from "@/public/img/AI/sparkling.png";

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
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [messages, dispatch] = useReducer(messagesReducer, []); // Initialize messages state
  const [loading, setLoading] = useState<boolean>(false);

  const modelValue = useMemo(() => {
    switch (selectedModel) {
      case "Rabbit":
        return 128;
      case "Bird":
        return 256;
      case "Turtle":
        return 526;
      default:
        return 128;
    }
  }, [selectedModel]);

  const typeValue = useMemo(() => {
    switch (selectedType) {
      case "Library":
        return "Information";
      case "Vul":
        return "Vulnerability";
      case "Message":
        return "Chat";
      default:
        return "Vulnerability";
    }
  }, [selectedType]);

  const handleModelSelect = (value: string) => {
    setSelectedModel(value);
  };

  const handleSelectType = (value: string) => {
    setSelectedType(value);
  };

  const handleMessage = async (message: string) => {
    // Add the user's message to the messages list
    dispatch({ type: ADD_MESSAGE, payload: { user: props.user, message } });
    const controller = new AbortController();

    if (message.length > 700) {
      alert(
        `Please enter code less than 700 characters. You are currently at ${message.length} characters.`
      );
      return;
    }

    setLoading(true); // Set loading to true when the request starts
    const body: ChatBody = {
      inputMessage: message,
      prompType: typeValue,
      length: modelValue,
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
          user: { username: "AI", imageUrl: aiChat.src },
          message: data.result,
        },
      });

      setLoading(false); // Set loading to false when the response is received
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong when fetching from the API.");
      setLoading(false); // Ensure loading is turned off in case of an error
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col h-screen">
        <header className="sticky top-0 z-10 flex h-[50px] items-center gap-1 border-b bg-background px-4">
          <h1 className="head-text">Workspace</h1>
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden" //error from medium screen
                style={{ color: "white" }}
              >
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
                <ModelSelect
                  onSelectModel={handleModelSelect}
                  onSelectType={handleSelectType}
                />
              </form>
            </DrawerContent>
          </Drawer>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
          >
            <Share className="w-5 h-5" />
            Save
          </Button>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:grid lg:grid-cols-3 lg:gap-6 overflow-hidden">
          <div className="relative hidden lg:flex lg:flex-col items-start h-full">
            <form className="grid w-full items-start gap-6 h-full">
              <ModelSelect
                onSelectModel={handleModelSelect}
                onSelectType={handleSelectType}
              />
            </form>
          </div>

          <div className="flex flex-col lg:col-span-2 h-full overflow-y-auto">
            <ChatMessage
              users={props.user}
              onButtonClick={handleMessage}
              messages={messages}
            />

            {loading && (
              <div className="flex justify-center items-center">
                <div className="loader"></div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainChat;
