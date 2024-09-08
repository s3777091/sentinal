import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types/types";
import smile from "@/public/img/AI/smile.png";
import { useTheme } from "next-themes";
import { EditIcon } from "lucide-react";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";

interface PostCardProps {
  posts: Post[];
  onEdit: (postId: string, newContent: string) => void;
  onDelete: (postId: string) => void;
}

const MAX_CONTENT_LENGTH = 100; // Define max content length

const PostCard: React.FC<PostCardProps> = React.memo(({ posts, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [newContent, setNewContent] = useState<string>("");

  const editIconTheme = theme === "dark" 
    ? "/assets/darkedit.svg" 
    : "/assets/edit.svg";

  const replyIconTheme = theme === "dark" 
    ? "/assets/darkreply.svg" 
    : "/assets/reply.svg";

  const deleteIconTheme = theme === "dark" 
    ? "/assets/darkdelete.svg" 
    : "/assets/delete.svg";

  const getTruncatedContent = (content: string) => {
    return content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH) + "..."
      : content;
  };

  const handleEditClick = (postId: string, currentContent: string) => {
    setEditingPostId(postId);
    setNewContent(currentContent);
  };

  const handleSaveClick = (postId: string) => {
    onEdit(postId, newContent); // Pass the updated content to the parent component
    setEditingPostId(null); // Close the editing form
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

                {/* Post Content */}
                {/* {editingPostId === post.id ? (
                  <div className="mt-2">
                    <Textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={5}
                      className="resize-none p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button onClick={() => handleSaveClick(post.id)} className="shad-button_primary">
                        Save
                      </Button>
                      <Button onClick={() => setEditingPostId(null)} className="shad-button_dark_4">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                )} */}
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
                    <Image
                      // onClick={() => handleEditClick(post.id, post.content)}
                      src={editIconTheme}
                      alt="Edit post"
                      width={24}
                      height={24}
                      className="cursor-pointer object-contain"
                    />
                    <Image
                      // onClick={() => onDelete(post.id)}
                      src={deleteIconTheme}
                      alt="Delete post"
                      width={24}
                      height={24}
                      className="cursor-pointer object-contain"
                    />
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
