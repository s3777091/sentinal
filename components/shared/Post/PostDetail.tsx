"use client";

import Image from "next/image";
import { Post, User } from "@prisma/client";
import { UserDetail } from "@/types/types";
import smile from "@/public/img/AI/smile.png";

import Loading from "@/components/Loading/Loading";
import { LiveProvider } from "./LiveProvider";

import { RoomProvider } from "@liveblocks/react/suspense";

import { ClientSideSuspense } from "@liveblocks/react";
import { CollaborativeApp } from "./CollaborativeApp";
import { ErrorBoundary } from "react-error-boundary";

interface PostDetailProps {
  post: Omit<Post, "authorId"> & {
    author: Pick<User, "id" | "username" | "image">;
  };
  user: UserDetail;
}

export default function PostDetail({ post, user }: PostDetailProps) {
  return (
    <div
      key={post.id}
      className="bg-gray-200 dark:bg-zinc-800 p-6 rounded-lg mb-3 shadow-md transition transform hover:scale-105 duration-300"
    >
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

      {/* Post Content */}
      <p className="mb-4 text-lg">{post.content}</p>

      {/* Post Image if available */}
      {post.imageUrl ? (
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 flex-shrink-0">
            <Image
              src={post.imageUrl}
              alt="Post image"
              width={600}
              height={400}
              className="rounded-lg shadow-md"
              objectFit="cover"
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
            <ClientSideSuspense fallback={<Loading />}>
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
