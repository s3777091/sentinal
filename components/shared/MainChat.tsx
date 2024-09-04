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
import ChatSelect from "@/components/forms/ChatSelect";
import ChatMessage from "@/components/forms/ChatMessage";
import { AIMessage, ChatBody, userDetail } from "@/types/types";
import aiChat from "@/public/img/AI/sparkling.png";

const ADD_MESSAGE = "ADD_MESSAGE";
const CLEAR_MESSAGES = "CLEAR_MESSAGES";

interface Message {
  user: userDetail;
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
  user: userDetail;
}

const MainChat = (props: Props) => {
  const [selectedType, setSelectedType] = useState<string>("");
  const [messages, dispatch] = useReducer(messagesReducer, []); // Initialize messages state
  const [loading, setLoading] = useState<boolean>(false);
  const [newConversation, setNewConversation] = useState<boolean>(false); // State to track if it's a new conversation

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
      alert(
        `Please enter code less than 700 characters. You are currently at ${message.length} characters.`
      );
      return;
    }

    setLoading(true);
    const body: ChatBody = {
      user: props.user.username,
      inputMessage: message,
      prompType: typeValue,
      length: 384,
      newConversation: newConversation, // Send newConversation flag
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
            userid: props.user.userid,
            imageUrl: aiChat.src,
          },
          message: data.result,
        },
      });

      setLoading(false);
      setNewConversation(false); // Reset the new conversation flag after the first message
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong when fetching from the API.");
      setLoading(false);
    }
  };

  const handleSelectType = (value: string) => {
    setSelectedType(value);
  };

  const startNewChat = () => {
    dispatch({ type: CLEAR_MESSAGES }); // Clear the current messages
    setNewConversation(true); // Set the new conversation flag
  };

  const sendScanMessage = async (message: string) => {
    try {
      dispatch({ type: ADD_MESSAGE, payload: { user: props.user, message } });
      const controller = new AbortController();

      if (message.length > 700) {
        alert(
          `Please enter code less than 700 characters. You are currently at ${message.length} characters.`
        );
        return;
      }

      const body = {
        message: message,
      };

      const response = await fetch("/api/kafka", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch the API. Status: ${response.status}`);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong when fetching from the API.");
    }
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