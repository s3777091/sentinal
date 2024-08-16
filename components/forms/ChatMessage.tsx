"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import MessageBox from "@/components/MessageBox";
import { userDetail } from "@/types/types";
import Image from "next/image";
import Bgdark from "@/public/img/dark/ai-chat/bg-image.png";

interface Props {
  users: userDetail;
  onButtonClick: (message: string) => void;
  messages: { user: userDetail; message: string }[];
}

const ChatMessage = ({ users, onButtonClick, messages }: Props) => {
  const [message, setMessage] = useState<string>("");

  const handleSubmit = () => {
    onButtonClick(message);
    setMessage(""); // Clear the input after submission
  };

  return (
    <div
      className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2"
      style={{
        color: "white",
        backgroundColor: "whitesmoke",
        borderColor: "white",
      }}
    >
      <div className="absolute left-[30%] top-[50%] z-[0] w-[240px] translate-y-[-50%] md:left-[35%] lg:left-[38%] xl:left-[30%] xl:w-[300px]">
        <Image
          width="340"
          height="181"
          src={Bgdark.src}
          className="absolute z-[0] w-[200px] translate-y-[-50%] xl:w-[350px]"
          alt=""
        />
      </div>
      {/* Scrollable message container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[400px]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start ${
              msg.user.username === "AI" ? "justify-start" : "justify-end"
            }`}
          >
            {msg.user.username === "AI" && (
              <div className="flex items-center">
                <img
                  src={msg.user.imageUrl || "/default-avatar.png"}
                  alt={msg.user.username || "User"}
                  className="w-6 h-6 rounded-full mr-3"
                />
              </div>
            )}
            <MessageBox output={`${msg.message}`} />
            {msg.user.username !== "AI" && (
              <img
                src={msg.user.imageUrl || "/default-avatar.png"}
                alt={msg.user.username || "User"}
                className="w-6 h-6 rounded-full ml-3"
              />
            )}
          </div>
        ))}
      </div>

      {/* Input and submit button always at the bottom */}
      <div className="mt-auto flex justify-end">
        <input
          className="mr-2.5 h-full min-h-[54px] w-full rounded-lg border border-zinc-200 bg-white px-5 py-5 text-sm font-medium text-zinc-950 placeholder:text-zinc-950 focus:outline-0 dark:border-zinc-800 dark:bg-transparent dark:text-white dark:placeholder:text-zinc-400"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          className="mt-auto flex h-[unset] w-[200px] items-center justify-center rounded-lg px-4 py-5 text-base font-medium"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default ChatMessage;
