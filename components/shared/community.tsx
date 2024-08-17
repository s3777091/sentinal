'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Like from "@/public/assets/like.svg";
import Comment from "@/public/assets/comment.svg";
import Share from "@/public/assets/share.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { userDetail } from "@/types/types";
import { UserDetailUpdate } from "@/app/supercode";

interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
}

const initialPosts: Post[] = [
    {
      id: 1,
      author: 'An Nguyen',
      avatar: '/assets/avatar1.jpg',
      content: 'Morning!',
      timestamp: '2h ago',
      likes: 34,
      comments: 12,
      shares: 4,
    },
    {
      id: 2,
      author: 'Hu Tao',
      avatar: '/assets/avatar2.jpg',
      content: 'How are you?',
      timestamp: '5h ago',
      likes: 22,
      comments: 8,
      shares: 2,
    },
    {
      id: 3,
      author: 'Hu Tao',
      avatar: '/assets/avatar2.jpg',
      content: 'How are you?',
      timestamp: '5h ago',
      likes: 22,
      comments: 8,
      shares: 2,
    },
    {
      id: 4,
      author: 'Kafka',
      avatar: '/assets/avatar3.jpg',
      content: 'Nice to meet you.',
      timestamp: '1d ago',
      likes: 54,
      comments: 16,
      shares: 7,
    },
    {
      id: 5,
      author: 'Kafka',
      avatar: '/assets/avatar3.jpg',
      content: 'Nice to meet you.',
      timestamp: '1d ago',
      likes: 54,
      comments: 16,
      shares: 7,
    },
    {
      id: 6,
      author: 'Kafka',
      avatar: '/assets/avatar3.jpg',
      content: 'Nice to meet you.',
      timestamp: '1d ago',
      likes: 54,
      comments: 16,
      shares: 7,
    },
  ];

interface AvatarProps {
  user: userDetail;
}

const Community = ({ user }: AvatarProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [inputValue, setInputValue] = useState<string>("");
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(inputValue);
    setInputValue("");
  };

  return (
    <div className="min-h-[100vh] bg-zinc-900 text-gray-200 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Community</h1>
        <form className="flex mb-8" onSubmit={handleSubmit}>
        <img
            src={user.imageUrl || "/default-avatar.png"}
            alt={user.username || "User"}
            className="w-10 h-10 rounded-full"
          />
          <Input
            className="ml-4 w-full"
            type="text"
            placeholder="What do you think?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button type="submit" className="ml-4">
            Post
          </Button>
        </form>

        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-zinc-800 p-6 rounded-lg mb-3 shadow-md transition transform hover:scale-105 duration-300"
          >
            <div className="flex items-center mb-4">
              <Image
                src={post.avatar}
                alt={`${post.author}'s avatar`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h2 className="text-xl font-semibold">{post.author}</h2>
                <p className="text-gray-400 text-sm">{post.timestamp}</p>
              </div>
            </div>
            <p className="mb-4 text-lg">{post.content}</p>
            <div className="flex justify-between text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <button className="flex items-center hover:text-red-600">
                  <Like />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center hover:text-zinc-500">
                  <Comment />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center hover:text-zinc-500">
                  <Share />
                  <span>{post.shares}</span>
                </button>
              </div>
              <button className="text-white hover:underline">Read more</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
