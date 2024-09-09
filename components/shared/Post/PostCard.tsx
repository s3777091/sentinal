"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types/types";
import smile from "@/public/img/AI/smile.png";
import { useTheme } from "next-themes";

import router from "next/router";

import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  posts: Post[];
  user: string;
}

const MAX_CONTENT_LENGTH = 100; // Define max content length

const PostCard: React.FC<PostCardProps> = React.memo(({ posts, user }) => {

  const { toast } = useToast();


  const handleDeleteClick = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch("/api/post", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          router.reload(); // Reload the page to reflect the changes
        } else {
          toast({
            variant: "destructive",
            title: "Uh oh! Delete post failed",
            description: `Failed to deleted post maybe, webhooks not active`,
          });
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const { theme } = useTheme();

  const editIconTheme =
    theme === "dark" ? "/assets/darkedit.svg" : "/assets/edit.svg";

  const replyIconTheme =
    theme === "dark" ? "/assets/darkreply.svg" : "/assets/reply.svg";

  const deleteIconTheme =
    theme === "dark" ? "/assets/darkdelete.svg" : "/assets/delete.svg";

  const getTruncatedContent = (content: string) => {
    return content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH) + "..."
      : content;
  };

  return (
    <>
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-gray-200 dark:bg-zinc-800 p-6 rounded-lg mb-3 shadow-md transition-transform hover:scale-105 duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-1 gap-4">
              <div className="flex flex-col items-center">
                {/* Author Avatar */}
                <div className="relative h-11 w-11">
                  <Image
                    src={post.author.image || smile.src}
                    alt={`${post.author.username}'s avatar`}
                    fill
                    className="cursor-pointer rounded-full"
                  />
                </div>

                {/* Optional Vertical Bar for Comments */}
                <div className="post-card_bar mt-2" />
              </div>

              <div className="flex-1 flex-col">
                {/* Author Information */}
                <div className="w-fit">
                  <h4 className="cursor-pointer text-base-semibold text-black dark:text-gray-400">
                    {post.author.username}
                  </h4>
                </div>

                <p className="mt-2 text-small-regular text-black dark:text-gray-400">
                  {getTruncatedContent(post.content)}
                </p>

                {/* Comments & Interaction Section */}
                <div className="mt-5 flex flex-col gap-3">
                  {/* Interaction Icons */}
                  <div className="flex gap-3.5">
                    <Link href={`/detail/${post.id}`}>
                      <Image
                        src={replyIconTheme}
                        alt="Reply to post"
                        width={24}
                        height={24}
                        className="cursor-pointer object-contain"
                      />
                    </Link>
                    {post.author.username === user && (
                      <>
                        <Link href={`/edit/${post.id}`}>
                          <Image
                            src={editIconTheme}
                            alt="Edit post"
                            width={24}
                            height={24}
                            className="cursor-pointer object-contain"
                          />
                        </Link>
                        <Image
                          onClick={() => handleDeleteClick(post.id.toString())}
                          src={deleteIconTheme}
                          alt="Delete post"
                          width={24}
                          height={24}
                          className="cursor-pointer object-contain"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </>
  );
});

export default PostCard;
