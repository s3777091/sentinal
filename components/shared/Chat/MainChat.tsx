"use client";

import React, { useState, useMemo, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import ChatSelect from "@/components/forms/Chat/ChatSelect";
import ChatMessage from "@/components/forms/Chat/ChatMessage";
import { ChatBody, UserDetail } from "@/types/types";
import aiChat from "@/public/img/AI/sparkling.png";
import { useToast } from "@/hooks/use-toast";

const ADD_MESSAGE = "ADD_MESSAGE";
const CLEAR_MESSAGES = "CLEAR_MESSAGES";

interface Message {
  user: UserDetail;
  message: string;
}
interface AddMessageAction {
  type: typeof ADD_MESSAGE;
  payload: Message;
}
interface ClearMessagesAction {
  type: typeof CLEAR_MESSAGES;
}
type MessagesState = Message[];

const messagesReducer = (
  state: MessagesState,
  action: AddMessageAction | ClearMessagesAction
): MessagesState => {
  switch (action.type) {
    case ADD_MESSAGE:
      return [...state, action.payload];
    case CLEAR_MESSAGES:
      return []; // Clear the messages
    default:
      return state;
  }
};

interface Props {
  user: UserDetail;
}

const MainChat = (props: Props) => {
  const [selectedType, setSelectedType] = useState<string>("");
  const [messages, dispatch] = useReducer(messagesReducer, []);
  const [newConversation, setNewConversation] = useState<boolean>(false);
  const { toast } = useToast();

  const typeValue = useMemo(() => {
    switch (selectedType) {
      case "Library":
        return "information";
      case "Vulnerable":
        return "vulnerable";
      default:
        return "Library";
    }
  }, [selectedType]);

  const handleMessage = async (message: string) => {
    dispatch({ type: ADD_MESSAGE, payload: { user: props.user, message } });
    const controller = new AbortController();

    if (message.length > 700) {
      toast({
        variant: "destructive",
        title: "Uh oh! Your text too long",
        description: `You are currently at ${message.length} characters.`,
      });
      return;
    }
    if (typeValue === "vulnerable") {
      toast({
        title: "Chat Security have longer time to generate text",
        description: `Server maybe sleep as long time no one using pls wait a maybe 1 minute`,
      });
    }

    const body: ChatBody = {
      userID: props.user.userid,
      inputMessage: message,
      prompType: typeValue,
      length: 384,
      newConversation: newConversation,
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
        toast({
          variant: "destructive",
          title: "Uh oh! Can't find existing chat",
          description: `Try to create new chat.`,
        });
      }

      const data = await response.json();
      dispatch({
        type: ADD_MESSAGE,
        payload: {
          user: {
            email: "skira_admin@gmail.com",
            username: "AI",
            userid: "skira",
            imageUrl: aiChat.src,
          },
          message: data.result,
        },
      });

      setNewConversation(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Skira server not set up yet",
        description: `Failed to fetch the API.`,
      });
    }
  };

  const handleSelectType = (value: string) => {
    setSelectedType(value);
  };

  const startNewChat = () => {
    dispatch({ type: CLEAR_MESSAGES }); // Clear the current messages
    setNewConversation(true); // Set the new conversation flag
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 flex h-[50px] items-center gap-1 border-b px-4">
        <h1 className="head-text">Workspace</h1>
        <ChatSelect onSelectType={handleSelectType} />
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5 text-sm"
          onClick={startNewChat} // Attach the startNewChat function to the onClick event
        >
          <Share className="w-5 h-5" />
          New Chat
        </Button>
      </header>

      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <ChatMessage
          onButtonClick={handleMessage} // Call handleButtonClick on button click
          messages={messages}
        />
      </main>
    </div>
  );
};

export default MainChat;
