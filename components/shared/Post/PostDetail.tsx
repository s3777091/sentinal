"use client";

import Image from "next/image";
import { Post, User } from "@prisma/client";
import smile from "@/public/img/AI/smile.png";
import { LiveProvider } from "./LiveProvider";

import { RoomProvider } from "@liveblocks/react/suspense";

import { ClientSideSuspense } from "@liveblocks/react";
import { CollaborativeApp } from "./CollaborativeApp";
import { ErrorBoundary } from "react-error-boundary";
import CommentLoading from "@/components/Loading/CommentLoading";

interface PostDetailProps {
  post: Omit<Post, "authorId"> & {
    author: Pick<User, "id" | "username" | "image">;
  };
}

export default function PostDetail({ post }: PostDetailProps) {
  return (
    <div
      key={post.id}
      className="bg-gray-200 dark:bg-zinc-800 p-6 rounded-lg mb-3 shadow-md transition transform hover:scale-105 duration-300"
    >
      {/* Post Title */}

      {/* Post Author Info */}
      <div className="flex items-center mb-4">
        <Image
          src={post.author?.image || smile.src}
          alt={`${post.author?.username || "Unknown"}'s avatar`}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h2 className="text-xl font-semibold">
            {post.author?.username || "Unknown"}
          </h2>
          <p className="text-gray-400 text-sm">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        {post.title || "Untitled Post"}
      </h1>
      {/* Post Content */}
      <p className="mb-4 text-lg">{post.content}</p>

      {/* Post Image if available */}
      {post.imageUrl ? (
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-3xl">
            <Image
              src={post.imageUrl}
              alt="Post image"
              width={600}
              height={400}
              className="rounded-lg shadow-md"
              style={{ objectFit: "cover", width: "100%", height: "auto" }}
            />
          </div>
        </div>
      ) : (
        <div className="post-comments">
          <h3 className="text-lg text-black dark:text-white mt-8">Comments</h3>
        </div>
      )}

      {/* Add the PostComment form */}
      <LiveProvider>
        <RoomProvider id={post.room}>
          <ErrorBoundary
            fallback={
              <div className="error">
                There was an error while getting threads.
              </div>
            }
          >
            <ClientSideSuspense fallback={<CommentLoading />}>
              <div className="mt-8">
                <CollaborativeApp />
              </div>
            </ClientSideSuspense>
          </ErrorBoundary>
        </RoomProvider>
      </LiveProvider>
    </div>
  );
}
