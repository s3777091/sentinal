import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types/types";

interface PostCardProps {
  posts: Post[];
  onReadMore: (id: number) => void;
}

const MAX_CONTENT_LENGTH = 100; // Define max content length

const PostCard: React.FC<PostCardProps> = React.memo(({ posts, onReadMore }) => {
  const [expandedPostIds, setExpandedPostIds] = useState<number[]>([]);

  const toggleReadMore = (id: number) => {
    if (expandedPostIds.includes(id)) {
      setExpandedPostIds(expandedPostIds.filter((postId) => postId !== id));
    } else {
      setExpandedPostIds([...expandedPostIds, id]);
    }
  };

  const getTruncatedContent = (content: string, id: number) => {
    if (expandedPostIds.includes(id)) {
      return content; // Show full content if expanded
    }
    return content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH) + "..."
      : content;
  };

  const isContentLong = (content: string) => content.length > MAX_CONTENT_LENGTH;

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
                <Link href={`/profile/${post.author.id}`} className="relative h-11 w-11">
                  <Image
                    src={post.author.image || "/default-avatar.png"}
                    alt={`${post.author.username}'s avatar`}
                    fill
                    className="cursor-pointer rounded-full"
                  />
                </Link>

                {/* Optional Vertical Bar for Comments */}
                <div className="post-card_bar mt-2" />
              </div>

              <div className="flex-1 flex-col">
                {/* Author Information */}
                <Link href={`/profile/${post.author.id}`} className="w-fit">
                  <h4 className="cursor-pointer text-base-semibold text-black dark:text-gray-400">
                    {post.author.username}
                  </h4>
                </Link>

                {/* Post Content */}
                <p className="mt-2 text-small-regular text-black dark:text-gray-400">
                  {getTruncatedContent(post.content, post.id)}
                </p>

                {/* Read More Button if content is long */}
                {isContentLong(post.content) && !expandedPostIds.includes(post.id) && (
                  <button
                    className="text-dark-1 dark:text-white hover:underline mt-2"
                    onClick={() => toggleReadMore(post.id)}
                  >
                    Read more
                  </button>
                )}

                {/* Comments & Interaction Section */}
                <div className="mt-5 flex flex-col gap-3">
                  {/* Interaction Icons */}
                  <div className="flex gap-3.5">
                    <Link href={`/detail/${post.id}`}>
                      <Image
                        src="/assets/reply.svg"
                        alt="Reply to post"
                        width={24}
                        height={24}
                        className="cursor-pointer object-contain"
                      />
                    </Link>
                    <Image
                      src="/assets/repost.svg"
                      alt="Repost"
                      width={24}
                      height={24}
                      className="cursor-pointer object-contain"
                    />
                    <Image
                      src="/assets/share.svg"
                      alt="Share post"
                      width={24}
                      height={24}
                      className="cursor-pointer object-contain"
                    />
                  </div>

                  {/* Display Number of Comments */}
                  {post.comments.length > 0 && (
                    <Link href={`/post/${post.id}`}>
                      <p className="mt-1 text-subtle-medium text-gray-1">
                        {post.comments.length} repl{post.comments.length > 1 ? "ies" : "y"}
                      </p>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {post.comments.length > 0 && (
              <div className="ml-1 mt-3 flex items-center gap-2">
                {post.comments.slice(0, 2).map((comment, index) => (
                  <Image
                    key={index}
                    src={comment.author.image || "/default-avatar.png"}
                    alt={`comment_author_${index}`}
                    width={24}
                    height={24}
                    className={`${index !== 0 ? "-ml-5" : ""} rounded-full object-cover`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Optionally Display "Read More" Button */}
          <div className="flex justify-between text-black dark:text-gray-400 text-sm mt-4">
            {expandedPostIds.includes(post.id) && (
              <button
                className="text-dark-1 dark:text-white hover:underline"
                onClick={() => toggleReadMore(post.id)}
              >
                Show less
              </button>
            )}
          </div>
        </article>
      ))}
    </>
  );
});

export default PostCard;