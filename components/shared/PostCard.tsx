import React from "react";
import { Post } from "@/types/types";

interface PostCardProps {
  posts: Post[];
  onReadMore: (id: number) => void;
}

const PostCard: React.FC<PostCardProps> = React.memo(({ posts, onReadMore }) => {
  return (
    <>
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-zinc-800 p-6 rounded-lg mb-3 shadow-md transition transform hover:scale-105 duration-300"
        >
          <div className="flex items-center mb-4">
            <img
              src={post.author.image || "/default-avatar.png"}
              alt={`${post.author.username}'s avatar`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h2 className="text-xl font-semibold">{post.author.username}</h2>
              <p className="text-gray-400 text-sm">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mb-4 text-lg">{post.content}</p>
          <div className="flex justify-between text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <button className="flex items-center hover:text-red-600">
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center hover:text-zinc-500">
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center hover:text-zinc-500">
                <span>{post.shares}</span>
              </button>
            </div>
            <button
              className="text-white hover:underline"
              onClick={() => onReadMore(post.id)}
            >
              Read more
            </button>
          </div>
        </div>
      ))}
    </>
  );
});

export default PostCard;